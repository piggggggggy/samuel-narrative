"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-bg-tertiary" />
    );
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        로그인
      </Link>
    );
  }

  const isAdmin = session.user?.isAdmin;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-sm font-medium text-text-secondary">
            {session.user?.name?.[0] || "U"}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl glass-panel py-1 overflow-hidden">
          <div className="border-b border-border-default px-4 py-2">
            <p className="text-sm font-medium text-text-primary">
              {session.user?.name}
            </p>
            <p className="text-xs text-text-muted">
              {session.user?.email}
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary"
            >
              관리자 대시보드
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-bg-tertiary"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
