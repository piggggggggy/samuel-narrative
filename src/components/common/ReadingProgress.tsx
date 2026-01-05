"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  const isPostPage = pathname?.startsWith("/posts/");

  useEffect(() => {
    if (!isPostPage) return;

    const updateProgress = () => {
      // 이전 RAF 취소
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!progressRef.current) return;

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        const clampedProgress = Math.min(1, Math.max(0, progress));

        // transform으로 GPU 가속 활용 (리렌더링 없이 직접 DOM 조작)
        progressRef.current.style.transform = `scaleX(${clampedProgress})`;
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [isPostPage, pathname]);

  if (!isPostPage) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border-default overflow-hidden">
      <div
        ref={progressRef}
        className="h-full w-full origin-left bg-accent-primary will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
