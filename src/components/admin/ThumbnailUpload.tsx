"use client";

import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Spinner } from "@/components/common";
import { compressImage, logCompressionResult } from "@/lib/utils";

interface ThumbnailUploadProps {
  value: string;
  onChange: (url: string) => void;
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

export function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        // 이미지 압축 (GIF/SVG는 자동으로 건너뜀)
        const result = await compressImage(file);
        logCompressionResult(result);

        const url = await uploadImage(result.file);
        onChange(url);
      } catch (err) {
        console.error("Thumbnail upload failed:", err);
        setError(
          err instanceof Error ? err.message : "이미지 업로드에 실패했습니다."
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <div className="relative h-40 w-64 overflow-hidden rounded-lg border border-border-default">
            <Image
              src={value}
              alt="썸네일 미리보기"
              fill
              className="object-cover"
              sizes="256px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-bg-primary transition-colors hover:bg-danger-hover"
            title="썸네일 삭제"
          >
            <XIcon aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm text-accent-primary hover:opacity-80"
          >
            이미지 변경
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-40 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragOver
              ? "border-accent-primary bg-bg-tertiary"
              : "border-border-default bg-bg-secondary hover:border-text-muted"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <span className="mt-2 text-sm text-text-secondary">
                업로드 중...
              </span>
            </div>
          ) : (
            <>
              <ImageIcon
                aria-hidden="true"
                className="h-10 w-10 text-text-muted"
              />
              <span className="mt-2 text-sm text-text-secondary">
                클릭 또는 드래그하여 업로드
              </span>
              <span className="mt-1 text-xs text-text-muted">최대 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p role="alert" className="body-6 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
