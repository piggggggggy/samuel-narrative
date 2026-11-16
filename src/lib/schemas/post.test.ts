import assert from "node:assert/strict";
import { test } from "node:test";
import { CreatePostInputSchema, UpdatePostInputSchema } from "@/lib/schemas";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";

const valid = {
  slug: "hello-world",
  title: "제목",
  content: "본문",
  excerpt: "요약",
  category: "dev",
};

test("the admin API validates with the same schemas as the store", () => {
  assert.equal(createPostSchema, CreatePostInputSchema);
  assert.equal(updatePostSchema, UpdatePostInputSchema);
});

test("accepts a valid new post and defaults tags to an empty list", () => {
  const result = CreatePostInputSchema.parse(valid);

  assert.deepEqual(result.tags, []);
});

test("rejects input the frontmatter schema would later reject", () => {
  const invalid = [
    { ...valid, excerpt: "" },
    { ...valid, publishedAt: "banana" },
    { ...valid, slug: "../secret" },
    { ...valid, slug: "Upper" },
    { ...valid, title: "a".repeat(201) },
    { ...valid, excerpt: "a".repeat(501) },
    { ...valid, category: "news" },
  ];

  for (const input of invalid) {
    assert.equal(CreatePostInputSchema.safeParse(input).success, false);
  }
});

test("rejects empty values on update but allows partial input", () => {
  assert.equal(UpdatePostInputSchema.safeParse({}).success, true);
  assert.equal(
    UpdatePostInputSchema.safeParse({ title: "새 제목" }).success,
    true
  );
  assert.equal(UpdatePostInputSchema.safeParse({ excerpt: "" }).success, false);
  assert.equal(UpdatePostInputSchema.safeParse({ content: "" }).success, false);
});
