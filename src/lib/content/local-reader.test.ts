import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  buildLocalIndex,
  listLocalPosts,
  readLocalPost,
  shouldReadLocally,
} from "@/lib/content/local-reader";

function markdown(fields: {
  title: string;
  publishedAt: string;
  tags?: string[];
  category?: string;
  body?: string;
}): string {
  const tags = (fields.tags ?? []).map((tag) => `"${tag}"`).join(", ");
  return [
    "---",
    `title: "${fields.title}"`,
    `excerpt: "${fields.title} 요약"`,
    `publishedAt: "${fields.publishedAt}"`,
    `tags: [${tags}]`,
    `category: "${fields.category ?? "dev"}"`,
    "---",
    "",
    fields.body ?? "본문",
  ].join("\n");
}

let root: string;
let postsDir: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "local-reader-"));
  postsDir = path.join(root, "posts");
  fs.mkdirSync(postsDir);
  fs.writeFileSync(
    path.join(postsDir, "older.md"),
    markdown({ title: "Older", publishedAt: "2026-01-01", tags: ["React"] })
  );
  fs.writeFileSync(
    path.join(postsDir, "newer.md"),
    markdown({
      title: "Newer",
      publishedAt: "2026-03-01",
      tags: ["react", "독후감"],
      category: "review",
    })
  );
  fs.writeFileSync(path.join(postsDir, "notes.txt"), "not a post");
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

test("reads locally only outside production and without GitHub config", () => {
  const github = { GITHUB_TOKEN: "t", GITHUB_OWNER: "o", GITHUB_REPO: "r" };

  assert.equal(shouldReadLocally({}), true);
  assert.equal(shouldReadLocally({ NODE_ENV: "development" }), true);
  assert.equal(shouldReadLocally({ GITHUB_TOKEN: "t" }), true);
  assert.equal(shouldReadLocally(github), false);
  assert.equal(shouldReadLocally({ NODE_ENV: "production" }), false);
  assert.equal(shouldReadLocally({ VERCEL: "1" }), false);
});

test("lists markdown posts newest first and ignores other files", () => {
  const posts = listLocalPosts(postsDir);

  assert.deepEqual(
    posts.map((post) => post.slug),
    ["newer", "older"]
  );
  assert.equal(posts[0].title, "Newer");
  assert.equal(posts[0].content.trim(), "본문");
});

test("returns an empty list when the posts directory is missing", () => {
  assert.deepEqual(listLocalPosts(path.join(root, "missing")), []);
});

test("reads one post by slug and returns null when it does not exist", () => {
  assert.equal(readLocalPost(postsDir, "older")?.title, "Older");
  assert.equal(readLocalPost(postsDir, "absent"), null);
});

test("rejects slugs that could leave the posts directory", () => {
  fs.writeFileSync(
    path.join(root, "secret.md"),
    markdown({ title: "Secret", publishedAt: "2026-02-01" })
  );

  assert.equal(readLocalPost(postsDir, "../secret"), null);
  assert.equal(readLocalPost(postsDir, "..%2Fsecret"), null);
  assert.equal(readLocalPost(postsDir, "Older"), null);
  assert.equal(readLocalPost(postsDir, ""), null);
});

test("builds the index from the files", () => {
  const index = buildLocalIndex(postsDir);

  assert.equal(index.totalCount, 2);
  assert.deepEqual(
    index.posts.map((post) => post.slug),
    ["newer", "older"]
  );
  assert.equal("content" in index.posts[0], false);
  assert.equal(typeof index.posts[0].readingTime, "number");
  assert.deepEqual(index.byTag, {
    react: ["newer", "older"],
    독후감: ["newer"],
  });
  assert.deepEqual(index.byCategory, {
    dev: ["older"],
    life: [],
    review: ["newer"],
  });
});

test("reflects file changes on the next read", () => {
  assert.equal(buildLocalIndex(postsDir).totalCount, 2);

  fs.writeFileSync(
    path.join(postsDir, "added.md"),
    markdown({ title: "Added", publishedAt: "2026-04-01" })
  );

  assert.equal(buildLocalIndex(postsDir).posts[0].slug, "added");
});

test("names the file when its frontmatter cannot be parsed", () => {
  fs.writeFileSync(
    path.join(postsDir, "broken.md"),
    '---\ntitle: "unterminated\n---\n\n본문'
  );

  assert.throws(() => listLocalPosts(postsDir), /broken\.md/);
  assert.throws(() => readLocalPost(postsDir, "broken"), /broken\.md/);
});
