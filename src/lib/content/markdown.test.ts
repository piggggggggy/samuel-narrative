import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  isValidSlug,
  parseMarkdownPost,
  readFrontmatter,
  serializePost,
} from "@/lib/content/markdown";

const base = {
  title: "제목",
  excerpt: "요약",
  publishedAt: "2026-01-02",
  tags: ["react"],
  category: "dev" as const,
};

test("accepts only lowercase letters, digits and hyphens as a slug", () => {
  assert.equal(isValidSlug("review-book-2"), true);
  assert.equal(isValidSlug("../secret"), false);
  assert.equal(isValidSlug("a/b"), false);
  assert.equal(isValidSlug("Upper"), false);
  assert.equal(isValidSlug(""), false);
});

test("round-trips text that would break hand-written YAML", () => {
  const fields = {
    ...base,
    title: "A \"quoted\" title: with \\ backslash, #hash and 'single'",
    excerpt: "첫 줄\n둘째 줄 - 대시로 시작하지 않는 한글",
    tags: ['say "hi"', "c#", "독후감", "a, b"],
  };

  const post = parseMarkdownPost("sample", serializePost(fields, "본문"));

  assert.equal(post.title, fields.title);
  assert.equal(post.excerpt, fields.excerpt);
  assert.deepEqual(post.tags, fields.tags);
  assert.equal(post.publishedAt, "2026-01-02");
  assert.equal(post.category, "dev");
  assert.equal(post.content.trim(), "본문");
});

test("keeps the body unchanged, including a frontmatter-like block", () => {
  const body =
    "# 제목\n\n---\n\ntitle: not frontmatter\n\n```ts\nconst a = 1;\n```";

  const post = parseMarkdownPost("sample", serializePost(base, body));

  assert.equal(post.content.trim(), body);
});

test("keeps unknown frontmatter keys and writes dates as plain strings", () => {
  const existing = readFrontmatter(
    "---\ntitle: old\nexcerpt: old\npublishedAt: 2025-12-30\ndraft: true\nseries: next\ntags: [a]\ncategory: life\n---\n\nold"
  );

  const output = serializePost(
    { ...base, publishedAt: undefined, updatedAt: "2026-02-03" },
    "new",
    existing
  );
  const data = readFrontmatter(output);

  assert.equal(data.draft, true);
  assert.equal(data.series, "next");
  assert.equal(data.publishedAt, "2025-12-30");
  assert.equal(data.updatedAt, "2026-02-03");
  assert.equal(data.title, "제목");
  assert.equal(parseMarkdownPost("s", output).publishedAt, "2025-12-30");
});

test("every post in the repository survives parse, serialize, parse", () => {
  const dir = path.join(process.cwd(), "content/posts");
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
  assert.ok(files.length > 0);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const before = parseMarkdownPost(file, raw);
    const after = parseMarkdownPost(
      file,
      serializePost(
        {
          title: before.title,
          excerpt: before.excerpt,
          publishedAt: before.publishedAt,
          updatedAt: before.updatedAt,
          tags: before.tags,
          category: before.category,
        },
        before.content,
        readFrontmatter(raw)
      )
    );

    assert.deepEqual(
      { ...after, content: after.content.trim() },
      { ...before, content: before.content.trim() },
      file
    );
  }
});
