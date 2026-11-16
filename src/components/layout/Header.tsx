"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

// 메뉴 링크는 60ms 간격으로 나타나고, 전체가 400ms를 넘지 않는다
const STAGGER_MS = 60;
const STAGGER_CAP_MS = 400;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // 메뉴가 열려 있는 동안 뒤 화면이 스크롤되지 않게 한다
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      <ReadingProgress />

      <header className="pointer-events-none sticky top-4 z-50 flex justify-center px-4">
        <nav
          aria-label="주요 메뉴"
          className="pointer-events-auto flex w-full items-center justify-between gap-6 rounded-2xl px-4 py-2 nav-surface md:w-fit"
        >
          <Link
            href="/"
            className="title-3 text-text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Samuel Narrative
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 title-4 transition-colors duration-300 ease-base ${
                  isActive(link.href)
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-primary glass-hover md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition-transform duration-500 ease-base ${
                    isMenuOpen ? "translate-y-1 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-current transition-transform duration-500 ease-base ${
                    isMenuOpen ? "-translate-y-1 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col gap-2 px-4 pb-8 pt-24 nav-panel md:hidden"
        >
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
              style={{
                animationDelay: `${Math.min(index * STAGGER_MS, STAGGER_CAP_MS)}ms`,
              }}
              className={`rounded-xl px-4 py-3 heading-5 nav-link-enter ${
                isActive(link.href)
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
