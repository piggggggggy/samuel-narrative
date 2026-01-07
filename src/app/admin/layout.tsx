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
      <div className="mb-8 flex items-center justify-between border-b border-border-default pb-4">
        <h1 className="text-2xl font-bold text-text-primary">
          관리자 대시보드
        </h1>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            대시보드
          </Link>
          <Link
            href="/admin/posts/new"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            새 글 작성
          </Link>
          <Link
            href="/"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            블로그로 돌아가기
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
