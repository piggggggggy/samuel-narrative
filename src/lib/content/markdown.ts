import matter from "gray-matter";
import type { Post } from "@/lib/schemas";
import { parseFrontmatter, toPost, formatValidationError } from "./schemas";

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
