import type { Post } from "@/lib/content/types";

interface DashboardStatsProps {
  posts: Post[];
}

export function DashboardStats({ posts }: DashboardStatsProps) {
  const totalPosts = posts.length;

  // 태그별 포스트 수 계산
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 전체 포스트 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          전체 포스트
        </div>
        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {totalPosts}
        </div>
      </div>

      {/* 태그 수 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          태그
        </div>
        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {Object.keys(tagCounts).length}
        </div>
      </div>

      {/* 인기 태그 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:col-span-2 lg:col-span-1">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          인기 태그
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {topTags.length > 0 ? (
            topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag}
                <span className="text-blue-600 dark:text-blue-300">({count})</span>
              </span>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500">태그 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
