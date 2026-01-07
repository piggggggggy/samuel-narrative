"use client";

import { useState, useRef, useCallback } from "react";
import { Spinner } from "@/components/common";
import { compressImage, logCompressionResult } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setState({ isUploading: true, progress: 0, error: null });

    try {
      // 이미지 압축 (GIF/SVG는 자동으로 건너뜀)
      const result = await compressImage(file);
      logCompressionResult(result);

      const formData = new FormData();
      formData.append("file", result.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setState({ isUploading: false, progress: 100, error: null });
      onUpload(data.url);
    } catch (error) {
      setState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    } else {
      setState((prev) => ({
        ...prev,
        error: "Please drop an image file",
      }));
    }
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? "border-accent-primary bg-accent-primary/10"
            : "border-border-default hover:border-text-muted"
        } ${state.isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {state.isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-sm text-text-secondary">
              업로드 중...
            </span>
          </div>
        ) : (
          <>
            <svg
              className="h-8 w-8 text-text-muted"
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
            <p className="mt-2 text-sm text-text-secondary">
              클릭하거나 이미지를 드래그해서 업로드
            </p>
            <p className="mt-1 text-xs text-text-muted">
              PNG, JPG, GIF, WebP (최대 5MB)
            </p>
          </>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </div>
  );
}
