"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { MarkdownEditor } from "./MarkdownEditor";
import { TagInput } from "./TagInput";
import { ButtonSpinner } from "@/components/common";
import { CATEGORY_LABELS, type Category } from "@/lib/schemas";
import type { Post } from "@/lib/content/types";

interface PostFormProps {
  post?: Post;
  mode: "create" | "edit";
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: Category;
}

const STORAGE_KEY = "post-draft";

const CATEGORIES: Category[] = ["dev", "life", "review"];

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    tags: post?.tags || [],
    category: post?.category || "dev",
  });

  // Load draft from localStorage (only for create mode)
  useEffect(() => {
    if (mode === "create") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setForm(draft);
          if (draft.slug) setSlugEdited(true);
        } catch {
          // ignore
        }
      }
    }
  }, [mode]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (mode === "create") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, mode]);

  useEffect(() => {
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [saveDraft]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && form.title && mode === "create") {
      setForm((prev) => ({
        ...prev,
        slug: slugify(prev.title, { lower: true, strict: true }),
      }));
    }
  }, [form.title, slugEdited, mode]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "slug") setSlugEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/posts" : `/api/posts/${post?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save post");
      }

      // Clear draft on successful create
      if (mode === "create") {
        localStorage.removeItem(STORAGE_KEY);
      }

      // 공개 화면은 다음 배포 후에 바뀌므로 관리자 목록으로 돌아간다
      const savedPost = await response.json();
      router.push(`/admin?saved=${encodeURIComponent(savedPost.slug)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: [],
      category: "dev",
    });
    setSlugEdited(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div role="alert" className="notice-danger body-6">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block caption-1 text-text-secondary">
          제목
        </label>
        <input
          type="text"
          id="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="field mt-1 body-3"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block caption-1 text-text-secondary">
          Slug
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="body-6 text-text-muted">/posts/</span>
          <input
            type="text"
            id="slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="field body-3"
            aria-describedby="slug-help"
            required
            pattern="^[a-z0-9-]+$"
            title="영문 소문자, 숫자, 하이픈만 사용할 수 있습니다"
          />
        </div>
        <p id="slug-help" className="mt-1 caption-5 text-text-muted">
          영문 소문자, 숫자, 하이픈만 사용 가능
        </p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block caption-1 text-text-secondary"
        >
          카테고리
        </label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value as Category)}
          className="field mt-1 body-3"
          required
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="block caption-1 text-text-secondary"
        >
          요약
        </label>
        <textarea
          id="excerpt"
          value={form.excerpt}
          onChange={(e) => updateField("excerpt", e.target.value)}
          rows={2}
          className="field mt-1 body-3"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block caption-1 text-text-secondary">태그</label>
        <div className="mt-1">
          <TagInput
            value={form.tags}
            onChange={(tags) => updateField("tags", tags)}
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block caption-1 text-text-secondary">내용</label>
        <div className="mt-1">
          <MarkdownEditor
            value={form.content}
            onChange={(content) => updateField("content", content)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="h-px bg-border-default" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {mode === "create" && (
            <button
              type="button"
              onClick={clearDraft}
              className="rounded-lg py-2 caption-1 text-text-muted transition-colors hover:text-text-primary"
            >
              임시저장 삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary button-sm"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary button-sm"
          >
            {isSubmitting && <ButtonSpinner />}
            {isSubmitting
              ? "저장 중..."
              : mode === "create"
                ? "발행하기"
                : "수정하기"}
          </button>
        </div>
      </div>
    </form>
  );
}
