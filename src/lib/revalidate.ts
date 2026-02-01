import { revalidatePath } from "next/cache";

/**
 * 포스트 관련 캐시를 revalidate합니다.
 * - 홈페이지 (포스트 목록)
 * - 포스트 상세 페이지
 * - 카테고리 페이지들
 */
export function revalidatePost(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/category/[category]", "page");

  if (slug) {
    revalidatePath(`/posts/${slug}`);
  }
}

/**
 * 모든 포스트 캐시를 revalidate합니다.
 */
export function revalidateAllPosts() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/category/[category]", "page");
}
