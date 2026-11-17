"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/posts/new", label: "새 글 작성" },
];

/**
 * 관리자 화면 상단: 지금 있는 화면을 표시한다
 */
export function AdminHeader() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="title-3 text-text-muted">관리자</p>
        <nav aria-label="관리자 메뉴" className="flex flex-wrap gap-x-6">
          {links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center caption-1 underline-offset-8 transition-colors ${
                  current
                    ? "text-text-primary underline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center caption-1 text-text-muted transition-colors hover:text-text-primary"
          >
            블로그로 돌아가기
          </Link>
        </nav>
      </div>
      <div className="h-px bg-border-default" />
    </div>
  );
}
