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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 전체 포스트 */}
      <div className="rounded-2xl border border-border-default bg-bg-secondary p-6">
        <div className="caption-1 text-text-secondary">전체 포스트</div>
        <div className="mt-2 heading-4 text-text-primary">{totalPosts}</div>
      </div>

      {/* 태그 수 */}
      <div className="rounded-2xl border border-border-default bg-bg-secondary p-6">
        <div className="caption-1 text-text-secondary">태그</div>
        <div className="mt-2 heading-4 text-text-primary">
          {Object.keys(tagCounts).length}
        </div>
      </div>

      {/* 인기 태그 */}
      <div className="rounded-2xl border border-border-default bg-bg-secondary p-6 sm:col-span-2 lg:col-span-1">
        <div className="caption-1 text-text-secondary">인기 태그</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {topTags.length > 0 ? (
            topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-tag-bg px-3 py-1 caption-4 text-tag-text"
              >
                {tag}
                <span className="text-text-muted">{count}</span>
              </span>
            ))
          ) : (
            <span className="body-6 text-text-muted">태그 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
