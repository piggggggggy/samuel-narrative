"use client";

import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/ssr/Copy";
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
    <div className="group relative my-6 glass-code">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded-sm px-2 py-1 caption-4 text-[#8b949e] opacity-0 transition-opacity hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
        aria-label={copied ? "복사됨" : "코드 복사"}
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
            복사됨
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <CopyIcon aria-hidden="true" className="h-3.5 w-3.5" />
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
