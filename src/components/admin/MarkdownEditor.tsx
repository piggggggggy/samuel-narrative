"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "마크다운으로 작성해주세요...",
  height = 500,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
        style={{ height }}
      />
    );
  }

  return (
    <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={height}
        preview="live"
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
