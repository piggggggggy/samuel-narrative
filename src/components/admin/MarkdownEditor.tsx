"use client";

import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { SpinnerOverlay } from "@/components/common";
import {
  compressImage,
  logCompressionResult,
  type ImageMetadata,
} from "@/lib/utils";

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const insertImageAtCursor = useCallback(
    (imageUrl: string, altText: string = "image", metadata?: ImageMetadata) => {
      // URL에 width/height 쿼리 파라미터 추가 (CLS 방지용)
      const urlWithMeta = metadata
        ? `${imageUrl}#w=${metadata.width}&h=${metadata.height}`
        : imageUrl;
      const imageMarkdown = `![${altText}](${urlWithMeta})`;
      // Insert at the end of content (cursor position handling is complex with MDEditor)
      onChange(value + "\n" + imageMarkdown);
    },
    [value, onChange]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("이미지 파일만 올릴 수 있습니다.");
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      try {
        // 이미지 압축 (GIF/SVG는 자동으로 건너뜀)
        const result = await compressImage(file);
        logCompressionResult(result);

        const url = await uploadImage(result.file);
        const altText = file.name.replace(/\.[^/.]+$/, "");
        insertImageAtCursor(url, altText, result.metadata);
      } catch (error) {
        console.error("Image upload failed:", error);
        setUploadError(
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
        className="animate-pulse rounded-lg bg-bg-secondary"
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
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-accent-primary bg-bg-secondary">
          <div className="text-center">
            <ImageIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-accent-primary"
            />
            <p className="mt-2 body-5 text-accent-primary">
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
      {uploadError && (
        <p role="alert" className="notice-danger mt-2 body-6">
          {uploadError}
        </p>
      )}
    </div>
  );
}
