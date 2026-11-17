"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReadingProgress } from "@/components/common";
import { CATEGORY_LABELS, CategorySchema } from "@/lib/schemas";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const links = [
  ...CategorySchema.options.map((category) => ({
    href: `/category/${category}`,
    label: CATEGORY_LABELS[category],
  })),
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <ReadingProgress />

      <header className="mx-auto w-full max-w-3xl px-4 pt-4 md:pt-6">
        {/* 좁은 화면에서는 메뉴 링크가 둘째 줄로 내려간다 */}
        <nav
          aria-label="주요 메뉴"
          className="flex flex-wrap items-center gap-x-8"
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center title-3 text-text-primary"
          >
            Samuel Narrative
          </Link>

          <div className="order-last flex w-full items-center gap-x-6 md:order-none md:w-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center title-4 underline-offset-8 transition-colors ${
                  isActive(link.href)
                    ? "text-text-primary underline"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </nav>
      </header>
    </>
  );
}
