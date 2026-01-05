"use client";

import { useState, useRef, useEffect } from "react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // 복사 상태 자동 초기화
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    if (!preRef.current) return;

    // pre 내부의 텍스트 콘텐츠 가져오기
    const code = preRef.current.textContent || "";

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300 opacity-0 transition-opacity hover:bg-gray-600 hover:text-white focus:opacity-100 group-hover:opacity-100"
        aria-label={copied ? "복사됨" : "코드 복사"}
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            복사됨
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            복사
          </span>
        )}
      </button>
      <pre ref={preRef} className={className}>
        {children}
      </pre>
    </div>
  );
}
