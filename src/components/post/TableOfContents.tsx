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
    <nav>
      <h2 className="mb-4 text-sm font-semibold text-text-primary">
        목차
      </h2>
      <ul className="space-y-2 text-sm">
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
                className={`block py-1 transition-colors hover:text-accent-primary ${
                  activeId === item.id
                    ? "font-medium text-accent-primary"
                    : "text-text-secondary"
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
