import { revalidatePath, revalidateTag } from "next/cache";

/**
 * 포스트 관련 캐시를 revalidate합니다.
 * - 홈페이지 (포스트 목록)
 * - 포스트 상세 페이지
 * - 태그 페이지들
 */
export function revalidatePost(slug?: string) {
  // 홈페이지 (포스트 목록)
  revalidatePath("/");

  // 관리자 대시보드
  revalidatePath("/admin");

  // 포스트 상세 페이지
  if (slug) {
    revalidatePath(`/posts/${slug}`);
  }

  // 태그 페이지 전체 (특정 태그를 알 수 없으므로)
  revalidatePath("/tags/[tag]", "page");
}

/**
 * 모든 포스트 캐시를 revalidate합니다.
 */
export function revalidateAllPosts() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/tags/[tag]", "page");
}
