import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NextRequest } from "next/server";

const ORIGIN = "http://localhost:3000";
const env = process.env as Record<string, string | undefined>;

let savedEnv: Record<string, string | undefined>;
let originalFetch: typeof fetch;

before(() => {
  savedEnv = { ...env };
  originalFetch = globalThis.fetch;
  Object.assign(env, {
    AUTH_SECRET: "test-secret-test-secret-test-secret-test-secret",
    AUTH_URL: ORIGIN,
    AUTH_TRUST_HOST: "true",
    GITHUB_ID: "test-client-id",
    GITHUB_SECRET: "test-client-secret",
    ADMIN_EMAILS: "admin@example.com",
  });

  globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url === "https://github.com/login/oauth/access_token") {
      return Response.json({
        access_token: "test-access-token",
        token_type: "bearer",
        scope: "read:user,user:email",
      });
    }
    if (url === "https://api.github.com/user") {
      return Response.json({
        id: 1,
        login: "admin",
        name: "Admin",
        email: "admin@example.com",
        avatar_url: "https://example.com/a.png",
      });
    }
    throw new Error(`unexpected request to ${url}`);
  }) as typeof fetch;
});

after(() => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(env)) {
    if (!(key in savedEnv)) delete env[key];
  }
  Object.assign(env, savedEnv);
});

function collectCookies(jar: Map<string, string>, response: Response) {
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";");
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

function cookieHeader(jar: Map<string, string>): string {
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

test("GitHub sign-in completes when the callback carries GitHub's iss parameter", async () => {
  const { handlers } = await import("@/lib/auth");
  const jar = new Map<string, string>();

  const csrfResponse = await handlers.GET(
    new NextRequest(`${ORIGIN}/api/auth/csrf`)
  );
  collectCookies(jar, csrfResponse);
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  const signInResponse = await handlers.POST(
    new NextRequest(`${ORIGIN}/api/auth/signin/github`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieHeader(jar),
      },
      body: new URLSearchParams({
        csrfToken,
        callbackUrl: `${ORIGIN}/admin`,
      }).toString(),
    })
  );
  collectCookies(jar, signInResponse);
  const authorizeUrl = new URL(signInResponse.headers.get("location") ?? "");
  assert.equal(authorizeUrl.origin, "https://github.com");
  assert.equal(
    authorizeUrl.searchParams.get("redirect_uri"),
    `${ORIGIN}/api/auth/callback/github`
  );

  const callbackUrl = new URL(`${ORIGIN}/api/auth/callback/github`);
  callbackUrl.searchParams.set("code", "test-code");
  callbackUrl.searchParams.set("iss", "https://github.com/login/oauth");
  const state = authorizeUrl.searchParams.get("state");
  if (state) callbackUrl.searchParams.set("state", state);

  const callbackResponse = await handlers.GET(
    new NextRequest(callbackUrl, { headers: { cookie: cookieHeader(jar) } })
  );
  collectCookies(jar, callbackResponse);

  assert.equal(callbackResponse.status, 302);
  assert.equal(callbackResponse.headers.get("location"), `${ORIGIN}/admin`);
  assert.ok(
    [...jar.keys()].some((name) => name.endsWith("authjs.session-token")),
    "a session cookie is set"
  );
});
