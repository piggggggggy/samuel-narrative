import { auth, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          관리자 대시보드
        </h1>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            대시보드
          </Link>
          <Link
            href="/admin/posts/new"
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            새 글 작성
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            블로그로 돌아가기
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
