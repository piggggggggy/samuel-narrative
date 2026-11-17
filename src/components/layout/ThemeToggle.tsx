"use client";

import { MoonIcon } from "@phosphor-icons/react/dist/ssr/Moon";
import { SunIcon } from "@phosphor-icons/react/dist/ssr/Sun";
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
      className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
      aria-label={`${nextLabel} 테마로 바꾸기`}
      title={`${nextLabel} 테마로 바꾸기`}
    >
      {isDark ? (
        <MoonIcon aria-hidden="true" className="h-5 w-5" />
      ) : (
        <SunIcon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
