import type { Post } from "@/lib/content";

export interface RelatedPostResult {
  post: Post;
  score: number;
  commonTags: string[];
}

/**
 * 태그 가중치 기반 관련 포스트 추출
 * 공통 태그 개수가 많을수록 관련도 점수가 높음
 */
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit = 3
): Post[] {
  if (currentPost.tags.length === 0) {
    return [];
  }

  const results: RelatedPostResult[] = allPosts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => {
      const commonTags = post.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      );
      return {
        post,
        score: commonTags.length,
        commonTags,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      // 1차: 공통 태그 개수
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // 2차: 최신 포스트 우선
      return (
        new Date(b.post.publishedAt).getTime() -
        new Date(a.post.publishedAt).getTime()
      );
    });

  return results.slice(0, limit).map(({ post }) => post);
}
