"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { ReadingProgress } from "@/components/common";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-elevated backdrop-blur-sm relative">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-text-primary"
        >
          Samuel&apos;s Blog
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-text-secondary transition-colors hover:text-text-primary"
            >
              {item.name}
            </Link>
          ))}
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Mobile: Theme Toggle + Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <UserMenu />
          <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary md:hidden"
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
        <div className="border-t border-border-default bg-bg-primary md:hidden">
          <div className="mx-auto max-w-4xl space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <ReadingProgress />
    </header>
  );
}
