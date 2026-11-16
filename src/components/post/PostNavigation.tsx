import Link from "next/link";
import type { PostMeta } from "@/lib/content";

interface PostNavigationProps {
  prevPostMeta: PostMeta | null;
  nextPostMeta: PostMeta | null;
}

export function PostNavigation({
  prevPostMeta,
  nextPostMeta,
}: PostNavigationProps) {
  if (!prevPostMeta && !nextPostMeta) {
    return null;
  }

  return (
    <nav
      aria-label="이전 글과 다음 글"
      className="mt-12 grid gap-4 sm:grid-cols-2"
    >
      {/* 이전 글 (더 오래된 글) */}
      {prevPostMeta ? (
        <Link
          href={`/posts/${prevPostMeta.slug}`}
          className="group flex flex-col gap-2 rounded-2xl p-4 glass-card"
        >
          <span className="flex items-center gap-1 caption-2 text-text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            이전 글
          </span>
          <span className="line-clamp-2 title-3 text-text-primary">
            {prevPostMeta.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* 다음 글 (더 최신 글) */}
      {nextPostMeta ? (
        <Link
          href={`/posts/${nextPostMeta.slug}`}
          className="group flex flex-col gap-2 rounded-2xl p-4 text-right glass-card sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1 caption-2 text-text-muted">
            다음 글
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </span>
          <span className="line-clamp-2 title-3 text-text-primary">
            {nextPostMeta.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
