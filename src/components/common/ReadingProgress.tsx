"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  // 포스트 페이지에서만 표시
  const isPostPage = pathname?.startsWith("/posts/");

  useEffect(() => {
    if (!isPostPage) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [isPostPage, pathname]);

  if (!isPostPage) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border-default">
      <div
        className="h-full bg-accent-primary transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
