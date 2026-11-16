import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { SnapshotProvider } from "@/lib/content/snapshot-provider";

const repoPosts = path.join(process.cwd(), "content/posts");
const repoSlugs = fs
  .readdirSync(repoPosts)
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.replace(/\.md$/, ""));

const env = process.env as Record<string, string | undefined>;

let savedEnv: NodeJS.ProcessEnv;
let originalFetch: typeof fetch;
let fetchCalls: number;

beforeEach(() => {
  savedEnv = { ...process.env };
  originalFetch = globalThis.fetch;
  fetchCalls = 0;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("network access is not expected");
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env)) {
    if (!(key in savedEnv)) delete process.env[key];
  }
  Object.assign(process.env, savedEnv);
});

function useProductionWithGitHubConfig() {
  Object.assign(process.env, {
    NODE_ENV: "production",
    GITHUB_TOKEN: "test-token",
    GITHUB_OWNER: "owner",
    GITHUB_REPO: "repo",
    BLOB_READ_WRITE_TOKEN: "blob-token",
  });
}

test("serves lists and bodies from the files without any network call, even in production with GitHub config", async () => {
  useProductionWithGitHubConfig();
  const provider = new SnapshotProvider();

  const metas = await provider.getAllPostMetas();
  const post = await provider.getPostBySlug(repoSlugs[0]);
  const reviews = await provider.getPostsByCategory("review");
  const tags = await provider.getAllTags();
  const tagged = await provider.getPostsByTag(tags[0].toUpperCase());
  const categories = await provider.getAllCategories();

  assert.deepEqual(
    metas.map((meta) => meta.slug).sort(),
    [...repoSlugs].sort()
  );
  assert.equal(post?.slug, repoSlugs[0]);
  assert.ok((post?.content.length ?? 0) > 0);
  assert.ok(reviews.length > 0);
  assert.ok(reviews.every((meta) => meta.category === "review"));
  assert.ok(tagged.length > 0);
  assert.ok(categories.includes("review"));
  assert.equal(await provider.getPostBySlug("../../README"), null);
  assert.equal(await provider.getPostBySlug("does-not-exist"), null);
  assert.equal(fetchCalls, 0);
});

test("lists every post that the body lookup can open", async () => {
  const provider = new SnapshotProvider();

  for (const meta of await provider.getAllPostMetas()) {
    const post = await provider.getPostBySlug(meta.slug);
    assert.equal(post?.title, meta.title, meta.slug);
  }
});

test("refuses to serve an empty blog in production", async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "snapshot-empty-"));
  try {
    env.NODE_ENV = "production";
    await assert.rejects(
      () => new SnapshotProvider(empty).getAllPostMetas(),
      /No posts found/
    );
    await assert.rejects(
      () => new SnapshotProvider(path.join(empty, "missing")).getAllPostMetas(),
      /No posts found/
    );
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});

test("returns an empty list for an empty directory in development", async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "snapshot-empty-"));
  try {
    delete env.NODE_ENV;
    delete env.VERCEL;
    assert.deepEqual(await new SnapshotProvider(empty).getAllPostMetas(), []);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});
