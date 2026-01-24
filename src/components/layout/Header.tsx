"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { ReadingProgress } from "@/components/common";
import { CATEGORY_LABELS, type Category } from "@/lib/schemas";

const categories: Category[] = ["dev", "life", "review"];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // 현재 경로가 특정 카테고리 페이지인지 확인
  const isActiveCategory = (category: Category) =>
    pathname === `/category/${category}` ||
    pathname.startsWith(`/category/${category}/`);

  const isActiveAbout = pathname === "/about";

  return (
    <header className="sticky top-0 z-50 glass relative">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-text-primary"
        >
          Samuel&apos;s Blog
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {/* 카테고리 링크 */}
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className={`relative pb-1 text-sm font-medium transition-colors ${
                isActiveCategory(category)
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {CATEGORY_LABELS[category]}
              {isActiveCategory(category) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary" />
              )}
            </Link>
          ))}

          {/* About 링크 */}
          <Link
            href="/about"
            className={`relative pb-1 text-sm font-medium transition-colors ${
              isActiveAbout
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            About
            {isActiveAbout && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary" />
            )}
          </Link>

          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Mobile: Theme Toggle + Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <UserMenu />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary glass-hover"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-border-default glass-panel md:hidden">
          <div className="mx-auto max-w-4xl space-y-1 px-4 py-3">
            {/* 카테고리 링크 */}
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category}`}
                className={`block rounded-md px-3 py-2 transition-colors ${
                  isActiveCategory(category)
                    ? "bg-bg-tertiary text-text-primary font-medium"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {CATEGORY_LABELS[category]}
              </Link>
            ))}

            {/* 구분선 */}
            <div className="my-2 border-t border-border-default" />

            {/* About 링크 */}
            <Link
              href="/about"
              className={`block rounded-md px-3 py-2 transition-colors ${
                isActiveAbout
                  ? "bg-bg-tertiary text-text-primary font-medium"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
      <ReadingProgress />
    </header>
  );
}
