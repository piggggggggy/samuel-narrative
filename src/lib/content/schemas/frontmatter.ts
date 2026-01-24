/**
 * Provider Layer - Frontmatter Schema
 *
 * MD 파일의 frontmatter 구조 정의
 * Provider별로 다른 형식을 가질 수 있음
 */

import { z } from "zod";
import type { Post, PostMeta } from "@/lib/schemas";

/**
 * GitHub Provider용 Frontmatter 스키마
 *
 * MD 파일 파싱 시 유연하게 처리:
 * - tags가 문자열이면 배열로 변환
 * - 날짜가 Date 객체면 문자열로 변환
 */
export const GitHubFrontmatterSchema = z.object({
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

export type GitHubFrontmatter = z.infer<typeof GitHubFrontmatterSchema>;

/**
 * Frontmatter 파싱 결과
 */
export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: z.ZodError;
}

/**
 * Frontmatter를 파싱하고 검증
 */
export function parseFrontmatter(
  data: unknown
): ParseResult<GitHubFrontmatter> {
  const result = GitHubFrontmatterSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Frontmatter + content를 Post로 변환
 */
export function toPost(
  slug: string,
  frontmatter: GitHubFrontmatter,
  content: string
): Post {
  return {
    slug,
    title: frontmatter.title,
    content,
    excerpt: frontmatter.excerpt,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    tags: frontmatter.tags,
  };
}

/**
 * Frontmatter를 PostMeta로 변환 (content 제외)
 */
export function toPostMeta(
  slug: string,
  frontmatter: GitHubFrontmatter,
  readingTime?: number
): PostMeta {
  return {
    slug,
    title: frontmatter.title,
    excerpt: frontmatter.excerpt,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    tags: frontmatter.tags,
    readingTime,
  };
}

/**
 * 검증 에러 메시지 포맷팅
 */
export function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
}
