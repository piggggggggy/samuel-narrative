"use client";

import { useState, useEffect } from "react";
import type { TocItem } from "@/lib/utils/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // 상단 20%, 하단 35% 영역 제외하고 중간 영역에서 감지
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    // 모든 헤딩 요소 관찰
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  // 헤딩 3개 미만이면 표시하지 않음
  if (items.length < 3) {
    return null;
  }

  return (
    <nav aria-label="목차" className="rounded-2xl p-4 glass-panel">
      <h2 className="mb-3 caption-3 text-text-muted">목차</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  // URL 해시 업데이트
                  window.history.pushState(null, "", `#${item.id}`);
                }
              }}
              aria-current={activeId === item.id ? "location" : undefined}
              className={`block py-1 transition-colors hover:text-text-primary ${
                activeId === item.id
                  ? "caption-1 text-accent-primary"
                  : "caption-2 text-text-secondary"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
