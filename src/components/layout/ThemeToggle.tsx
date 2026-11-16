"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 예전 테마 값(dark-1, dark-2)이 저장된 방문자는 다크로 옮긴다
  useEffect(() => {
    if (theme === "dark-1" || theme === "dark-2") {
      setTheme("dark");
    }
  }, [theme, setTheme]);

  const isDark = mounted && resolvedTheme !== "light";
  const nextLabel = isDark ? "라이트" : "다크";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary glass-hover hover:text-text-primary"
      aria-label={`${nextLabel} 테마로 바꾸기`}
      title={`${nextLabel} 테마로 바꾸기`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        {isDark ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        )}
      </svg>
    </button>
  );
}
