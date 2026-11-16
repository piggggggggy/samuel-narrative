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
        <nav aria-label="관리자 메뉴" className="flex flex-wrap gap-1">
          {links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-lg px-3 py-2 caption-1 transition-colors ${
                  current
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 caption-1 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            블로그로 돌아가기
          </Link>
        </nav>
      </div>
      <div className="h-px bg-border-default" />
    </div>
  );
}
