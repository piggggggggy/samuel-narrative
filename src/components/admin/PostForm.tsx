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

      const savedPost = await response.json();
      router.push(`/posts/${savedPost.slug}`);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-text-secondary"
        >
          제목
        </label>
        <input
          type="text"
          id="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="mt-1 block w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-text-primary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-text-secondary"
        >
          Slug
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-border-default bg-bg-secondary px-3 text-sm text-text-muted">
            /posts/
          </span>
          <input
            type="text"
            id="slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="block w-full rounded-none rounded-r-md border border-border-default bg-bg-primary px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            required
            pattern="^[a-z0-9-]+$"
            title="영문 소문자, 숫자, 하이픈만 사용할 수 있습니다"
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">
          영문 소문자, 숫자, 하이픈만 사용 가능
        </p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-text-secondary"
        >
          카테고리
        </label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value as Category)}
          className="mt-1 block w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-text-primary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
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
          className="block text-sm font-medium text-text-secondary"
        >
          요약
        </label>
        <textarea
          id="excerpt"
          value={form.excerpt}
          onChange={(e) => updateField("excerpt", e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 text-text-primary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-text-secondary">
          태그
        </label>
        <div className="mt-1">
          <TagInput
            value={form.tags}
            onChange={(tags) => updateField("tags", tags)}
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-text-secondary">
          내용
        </label>
        <div className="mt-1">
          <MarkdownEditor
            value={form.content}
            onChange={(content) => updateField("content", content)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border-default pt-6">
        <div>
          {mode === "create" && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-sm text-text-muted hover:text-text-secondary"
            >
              임시저장 삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-border-default bg-bg-primary px-4 py-2 text-sm font-medium text-text-secondary shadow-sm hover:bg-bg-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-text-inverted shadow-sm hover:opacity-90 disabled:opacity-50"
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
