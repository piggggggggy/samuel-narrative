import { getContentProvider } from "@/lib/content";
import { DashboardStats, PostTable } from "@/components/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 대시보드",
};

export default async function AdminDashboardPage() {
  const provider = await getContentProvider();
  const posts = await provider.getAllPosts();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        대시보드
      </h1>

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
