"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Spinner, SpinnerOverlay } from "@/components/common";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "마크다운으로 작성해주세요...",
  height = 500,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const insertImageAtCursor = useCallback(
    (imageUrl: string, altText: string = "image") => {
      const imageMarkdown = `![${altText}](${imageUrl})`;
      // Insert at the end of content (cursor position handling is complex with MDEditor)
      onChange(value + "\n" + imageMarkdown);
    },
    [value, onChange]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB를 초과할 수 없습니다.");
        return;
      }

      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        const altText = file.name.replace(/\.[^/.]+$/, "");
        insertImageAtCursor(url, altText);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert(
          error instanceof Error
            ? error.message
            : "이미지 업로드에 실패했습니다."
        );
      } finally {
        setIsUploading(false);
      }
    },
    [insertImageAtCursor]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleImageUpload(file);
          }
          break;
        }
      }
    },
    [handleImageUpload]
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      for (const file of imageFiles) {
        await handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("paste", handlePaste);
    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);

    return () => {
      container.removeEventListener("paste", handlePaste);
      container.removeEventListener("drop", handleDrop);
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
    };
  }, [handlePaste, handleDrop, handleDragOver, handleDragLeave]);

  if (!mounted) {
    return (
      <div
        className="animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
        style={{ height }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
      className="relative"
    >
      {isUploading && <SpinnerOverlay message="이미지 업로드 중..." />}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-md border-2 border-dashed border-blue-500 bg-blue-50/80 dark:bg-blue-900/30">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              이미지를 여기에 놓으세요
            </p>
          </div>
        </div>
      )}
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
