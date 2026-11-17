import type { Post } from "@/lib/content/types";

interface DashboardStatsProps {
  posts: Post[];
}

export function DashboardStats({ posts }: DashboardStatsProps) {
  const totalPosts = posts.length;

  // 태그별 포스트 수 계산
  const tagCounts = posts.reduce(
    (acc, post) => {
      post.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <dl className="flex flex-wrap gap-x-12 gap-y-6">
      <div>
        <dt className="caption-2 text-text-muted">전체 포스트</dt>
        <dd className="mt-1 heading-5 text-text-primary">{totalPosts}</dd>
      </div>

      <div>
        <dt className="caption-2 text-text-muted">태그</dt>
        <dd className="mt-1 heading-5 text-text-primary">
          {Object.keys(tagCounts).length}
        </dd>
      </div>

      <div>
        <dt className="caption-2 text-text-muted">인기 태그</dt>
        <dd className="mt-1 flex min-h-8 flex-wrap items-center gap-x-4 gap-y-1 body-6 text-text-primary">
          {topTags.length > 0 ? (
            topTags.map(([tag, count]) => (
              <span key={tag} className="inline-flex items-center gap-1">
                {tag}
                <span className="text-text-muted">{count}</span>
              </span>
            ))
          ) : (
            <span className="text-text-muted">태그 없음</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
