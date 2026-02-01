import type { Post, PostMeta } from "@/lib/content";

export interface RelatedPostResult {
  postMeta: PostMeta;
  score: number;
  commonTags: string[];
}

/**
 * 태그 가중치 기반 관련 포스트 추출
 * 공통 태그 개수가 많을수록 관련도 점수가 높음
 */
export function getRelatedPosts(
  currentPost: Post,
  allPostMetas: PostMeta[],
  limit = 3
): PostMeta[] {
  if (currentPost.tags.length === 0) {
    return [];
  }

  const results: RelatedPostResult[] = allPostMetas
    .filter((postMeta) => postMeta.slug !== currentPost.slug)
    .map((postMeta) => {
      const commonTags = postMeta.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      );
      return {
        postMeta,
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
        new Date(b.postMeta.publishedAt).getTime() -
        new Date(a.postMeta.publishedAt).getTime()
      );
    });

  return results.slice(0, limit).map(({ postMeta }) => postMeta);
}
