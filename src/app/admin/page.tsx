import { getContentProvider } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 대시보드",
};

export default async function AdminDashboardPage() {
  const provider = await getContentProvider();
  const posts = await provider.getAllPosts();
  const tags = await provider.getAllTags();

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">전체 포스트</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {posts.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">태그</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {tags.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">최근 포스트</p>
          <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white truncate">
            {posts[0]?.title || "없음"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          새 글 작성
        </Link>
      </div>

      {/* Posts List */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            포스트 목록
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {posts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              아직 작성된 포스트가 없습니다.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <time>
                      {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                    </time>
                    {post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{post.tags.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    수정
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
