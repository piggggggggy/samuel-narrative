"use client";

import { useEffect, useRef, useState } from "react";

interface TaglineRevealProps {
  /** 한 줄에 한 문장. 줄바꿈 위치를 직접 정한다. */
  lines: string[];
}

/**
 * 큰 글자 문구 구간
 * 스크롤에 따라 단어가 읽는 순서대로 하나씩 또렷해진다.
 */
export function TaglineReveal({ lines }: TaglineRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = lines.map((line) => line.split(" "));
  const total = words.reduce((count, line) => count + line.length, 0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 문구 위쪽이 화면의 85% 지점에 닿을 때 시작해서 45% 지점에서 끝난다
      const start = viewport * 0.85;
      const end = viewport * 0.45;
      const progress = (start - rect.top) / (start - end + rect.height);
      const next = Math.round(Math.min(1, Math.max(0, progress)) * total);
      // 한 번 켜진 단어는 다시 꺼지지 않는다
      setActiveCount((current) => Math.max(current, next));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

  let index = 0;

  return (
    <p
      ref={ref}
      className="max-w-2xl heading-4 text-text-primary md:heading-3"
      aria-label={lines.join(" ")}
    >
      {words.map((line, lineIndex) => (
        <span key={lines[lineIndex]} className="block" aria-hidden="true">
          {line.map((word) => {
            const wordIndex = index++;
            return (
              <span
                key={`${wordIndex}-${word}`}
                className="tagline-word"
                data-active={wordIndex < activeCount}
              >
                {word}{" "}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
