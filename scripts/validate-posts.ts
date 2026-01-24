/**
 * 포스트 스키마 검증 스크립트
 *
 * 모든 포스트의 frontmatter를 스키마로 검증합니다.
 * - pnpm run schema:validate
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");

// Provider Layer 스키마 (직접 정의 - tsx에서 path alias 문제 방지)
const GitHubFrontmatterSchema = z.object({
  title: z.string().min(1, "title은 필수입니다"),
  excerpt: z.string().min(1, "excerpt는 필수입니다"),
  publishedAt: z.union([z.string(), z.date()]).transform((val) => {
    if (val instanceof Date) {
      return val.toISOString().split("T")[0];
    }
    return val;
  }),
  updatedAt: z
    .union([z.string(), z.date()])
    .transform((val) => {
      if (val instanceof Date) {
        return val.toISOString().split("T")[0];
      }
      return val;
    })
    .optional(),
  tags: z
    .union([z.array(z.string()), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        return val
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      return val;
    })
    .default([]),
  draft: z.boolean().default(false),
});

interface ValidationResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    console.warn(`Posts directory not found: ${POSTS_DIRECTORY}`);
    return [];
  }
  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".md"));
}

function validatePost(filename: string): ValidationResult {
  const filePath = path.join(POSTS_DIRECTORY, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  try {
    const { data } = matter(fileContent);
    const result = GitHubFrontmatterSchema.safeParse(data);

    if (result.success) {
      return { file: filename, valid: true };
    }

    return {
      file: filename,
      valid: false,
      errors: result.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      ),
    };
  } catch (error) {
    return {
      file: filename,
      valid: false,
      errors: [`Parse error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  POST SCHEMA VALIDATION");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const files = getPostFiles();

  if (files.length === 0) {
    console.log("No post files found.\n");
    return;
  }

  console.log(`Found ${files.length} post files\n`);

  const results = files.map(validatePost);
  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid).length;

  // 유효한 포스트
  const validPosts = results.filter((r) => r.valid);
  if (validPosts.length > 0) {
    console.log(`✅ Valid posts (${validPosts.length}):`);
    validPosts.forEach((r) => {
      console.log(`   ${r.file}`);
    });
    console.log();
  }

  // 유효하지 않은 포스트
  const invalidPosts = results.filter((r) => !r.valid);
  if (invalidPosts.length > 0) {
    console.log(`❌ Invalid posts (${invalidPosts.length}):`);
    invalidPosts.forEach((r) => {
      console.log(`\n   ${r.file}`);
      r.errors?.forEach((err) => {
        console.log(`      - ${err}`);
      });
    });
    console.log();
  }

  // 요약
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`Summary: ${validCount} valid, ${invalidCount} invalid`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // 실패 시 exit code 1
  if (invalidCount > 0) {
    process.exit(1);
  }
}

main();
