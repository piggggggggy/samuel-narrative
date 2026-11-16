import matter from "gray-matter";
import type { Category, Post } from "@/lib/schemas";
import { parseFrontmatter, toPost, formatValidationError } from "./schemas";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * slug가 파일 경로나 API 경로에 넣어도 안전한 형식인지 확인
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export interface PostFields {
  title: string;
  excerpt: string;
  publishedAt?: string;
  updatedAt?: string;
  tags: string[];
  category: Category;
}

/**
 * Markdown 파일의 frontmatter를 검증 없이 그대로 읽기
 */
export function readFrontmatter(fileContent: string): Record<string, unknown> {
  return matter(fileContent, {}).data;
}

/**
 * Post를 Markdown 파일 내용으로 변환
 *
 * base에 기존 frontmatter를 넘기면 관리하지 않는 키(draft 등)를 보존한다.
 * fields에서 undefined인 값은 base의 값을 덮어쓰지 않는다.
 */
export function serializePost(
  fields: PostFields,
  content: string,
  base: Record<string, unknown> = {}
): string {
  const data: Record<string, unknown> = { ...base };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      data[key] = value;
    }
  });

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) {
      delete data[key];
    } else if (value instanceof Date) {
      data[key] = value.toISOString().split("T")[0];
    }
  });

  return matter.stringify(`\n${content.replace(/^\n+/, "")}`, data, {
    lineWidth: -1,
  } as Parameters<typeof matter.stringify>[2]);
}

/**
 * Markdown 파일 내용을 Post로 변환
 */
export function parseMarkdownPost(slug: string, fileContent: string): Post {
  // 옵션을 넘기면 gray-matter가 결과를 캐시하지 않는다.
  // 캐시가 켜져 있으면 잘못된 YAML이 두 번째 호출부터 빈 frontmatter로 통과한다.
  const { data, content } = matter(fileContent, {});
  const cleanSlug = slug.replace(/\.md$/, "");

  // Frontmatter 스키마 검증
  const result = parseFrontmatter(data);

  if (!result.success) {
    const errorMsg = formatValidationError(result.error!);
    console.error(`[${cleanSlug}] Frontmatter validation failed: ${errorMsg}`);
    // 검증 실패 시에도 기본값으로 파싱 시도 (빌드 중단 방지)
    const rawCategory = (data as Record<string, unknown>).category as string;
    return {
      slug: cleanSlug,
      title: ((data as Record<string, unknown>).title as string) || "Untitled",
      content,
      excerpt: ((data as Record<string, unknown>).excerpt as string) || "",
      publishedAt:
        ((data as Record<string, unknown>).publishedAt as string) ||
        new Date().toISOString().split("T")[0],
      tags: Array.isArray((data as Record<string, unknown>).tags)
        ? ((data as Record<string, unknown>).tags as string[])
        : [],
      category:
        rawCategory === "dev" ||
        rawCategory === "life" ||
        rawCategory === "review"
          ? rawCategory
          : "dev",
    };
  }

  return toPost(cleanSlug, result.data!, content);
}
