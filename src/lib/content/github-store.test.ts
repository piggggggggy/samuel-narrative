import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { GitHubPostStore } from "@/lib/content/github-store";
import { parseMarkdownPost, readFrontmatter } from "@/lib/content/markdown";

interface Call {
  method: string;
  url: string;
  body?: { message: string; content: string; sha?: string; branch: string };
}

const API = "https://api.github.com/repos/owner/repo/contents/content/posts";
const indexPath = path.join(process.cwd(), "content/posts-index.json");

let savedEnv: NodeJS.ProcessEnv;
let originalFetch: typeof fetch;
let calls: Call[];
let remote: Record<string, string>;
let indexBefore: string | null;

function fileResponse(text: string) {
  return {
    sha: "sha-1",
    encoding: "base64",
    content: Buffer.from(text).toString("base64"),
  };
}

beforeEach(() => {
  savedEnv = { ...process.env };
  originalFetch = globalThis.fetch;
  calls = [];
  remote = {};
  indexBefore = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, "utf-8")
    : null;
  Object.assign(process.env, {
    GITHUB_TOKEN: "test-token",
    GITHUB_OWNER: "owner",
    GITHUB_REPO: "repo",
    GITHUB_BRANCH: "preview",
  });
  delete process.env.VERCEL;

  globalThis.fetch = (async (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1]
  ) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, url, body });

    const name = url.slice(API.length).split("?")[0].replace(/^\//, "");
    if (method === "GET" && name === "") {
      return Response.json(
        Object.keys(remote).map((file) => ({
          name: file,
          path: `content/posts/${file}`,
          sha: "sha-1",
          type: "file",
        }))
      );
    }
    if (method === "GET") {
      return name in remote
        ? Response.json(fileResponse(remote[name]))
        : new Response("Not Found", { status: 404 });
    }
    return Response.json({});
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env)) {
    if (!(key in savedEnv)) delete process.env[key];
  }
  Object.assign(process.env, savedEnv);
  const indexAfter = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, "utf-8")
    : null;
  assert.equal(indexAfter, indexBefore, "the store must not touch the index");
});

function written(call: Call) {
  return Buffer.from(call.body!.content, "base64").toString("utf-8");
}

test("reads a post from GitHub on the configured branch when config is present", async () => {
  remote["hello.md"] =
    '---\ntitle: "Remote"\nexcerpt: "e"\npublishedAt: "2026-05-01"\ntags: []\ncategory: "dev"\n---\n\nbody';

  const post = await new GitHubPostStore().getPost("hello");

  assert.equal(post?.title, "Remote");
  assert.deepEqual(
    calls.map((call) => call.url),
    [`${API}/hello.md?ref=preview`]
  );
});

test("lists posts from GitHub newest first", async () => {
  remote["old.md"] =
    '---\ntitle: "Old"\nexcerpt: "e"\npublishedAt: "2026-01-01"\ntags: []\ncategory: "dev"\n---\n\nbody';
  remote["new.md"] =
    '---\ntitle: "New"\nexcerpt: "e"\npublishedAt: "2026-03-01"\ntags: []\ncategory: "dev"\n---\n\nbody';

  const posts = await new GitHubPostStore().listPosts();

  assert.deepEqual(
    posts.map((post) => post.slug),
    ["new", "old"]
  );
});

test("creates a post with one commit that parses back to the input", async () => {
  const input = {
    slug: "quoted",
    title: 'He said "hi": ok',
    excerpt: "요약 'x'",
    content: "본문",
    tags: ['a "b"'],
    category: "life" as const,
    publishedAt: "2026-04-05",
  };

  const post = await new GitHubPostStore().createPost(input);

  const puts = calls.filter((call) => call.method === "PUT");
  assert.equal(puts.length, 1);
  assert.equal(puts[0].url, `${API}/quoted.md`);
  assert.equal(puts[0].body?.branch, "preview");
  const saved = parseMarkdownPost("quoted", written(puts[0]));
  assert.equal(saved.title, input.title);
  assert.equal(saved.excerpt, input.excerpt);
  assert.deepEqual(saved.tags, input.tags);
  assert.equal(saved.category, "life");
  assert.equal(saved.publishedAt, "2026-04-05");
  assert.equal(saved.content.trim(), "본문");
  assert.equal(post.slug, "quoted");
});

test("refuses to create a post whose slug already exists", async () => {
  remote["taken.md"] = "---\ntitle: t\n---\n\nbody";

  await assert.rejects(
    () =>
      new GitHubPostStore().createPost({
        slug: "taken",
        title: "t",
        excerpt: "e",
        content: "c",
        tags: [],
        category: "dev",
      }),
    /already exists/
  );
  assert.equal(calls.filter((call) => call.method === "PUT").length, 0);
});

test("updates only the given fields, keeps other frontmatter and sets updatedAt", async () => {
  remote["post.md"] =
    '---\ntitle: "Before"\nexcerpt: "keep me"\npublishedAt: "2025-12-30"\ntags: ["a"]\ncategory: "review"\ndraft: true\n---\n\nold body';

  const post = await new GitHubPostStore().updatePost("post", {
    title: 'After "quote"',
    content: "new body",
  });

  const put = calls.find((call) => call.method === "PUT")!;
  const data = readFrontmatter(written(put));
  const today = new Date().toISOString().split("T")[0];
  assert.equal(put.body?.sha, "sha-1");
  assert.equal(data.title, 'After "quote"');
  assert.equal(data.excerpt, "keep me");
  assert.equal(data.publishedAt, "2025-12-30");
  assert.equal(data.updatedAt, today);
  assert.equal(data.draft, true);
  assert.equal(data.category, "review");
  assert.equal(
    parseMarkdownPost("post", written(put)).content.trim(),
    "new body"
  );
  assert.equal(post.updatedAt, today);
});

test("deletes with the current sha", async () => {
  remote["gone.md"] = "---\ntitle: t\n---\n\nbody";

  await new GitHubPostStore().deletePost("gone");

  const del = calls.find((call) => call.method === "DELETE")!;
  assert.equal(del.url, `${API}/gone.md`);
  assert.equal(del.body?.sha, "sha-1");
});

test("never sends an unsafe slug to GitHub", async () => {
  const store = new GitHubPostStore();

  assert.equal(await store.getPost("../../README"), null);
  await assert.rejects(
    () => store.updatePost("../x", { title: "t" }),
    /not found/
  );
  await assert.rejects(() => store.deletePost("a/b"), /not found/);
  await assert.rejects(
    () =>
      store.createPost({
        slug: "../x",
        title: "t",
        excerpt: "e",
        content: "c",
        tags: [],
        category: "dev",
      }),
    /Invalid slug/
  );
  assert.equal(calls.length, 0);
});

test("reads the checkout when GitHub config is absent outside production", async () => {
  for (const key of ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"]) {
    delete process.env[key];
  }
  const slugs = fs
    .readdirSync(path.join(process.cwd(), "content/posts"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
  const store = new GitHubPostStore();

  assert.equal((await store.listPosts()).length, slugs.length);
  assert.equal((await store.getPost(slugs[0]))?.slug, slugs[0]);
  assert.equal(calls.length, 0);
});
