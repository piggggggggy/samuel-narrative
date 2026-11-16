import { getPostStore } from "@/lib/content";
import { DashboardStats, PostTable } from "@/components/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 대시보드",
};

interface AdminDashboardPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const { saved } = await searchParams;
  const store = await getPostStore();
  const posts = await store.listPosts();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        대시보드
      </h1>

      {saved && (
        <p
          role="status"
          className="rounded-md border border-border-default bg-bg-secondary px-4 py-3 text-sm text-text-primary"
        >
          <span className="font-medium">{saved}</span> 글을 저장했습니다. 공개
          화면에는 다음 배포가 끝난 뒤에 반영됩니다.
        </p>
      )}

      {/* Stats */}
      <DashboardStats posts={posts} />

      {/* Posts Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          포스트 관리
        </h2>
        <PostTable posts={posts} />
      </div>
    </div>
  );
}
