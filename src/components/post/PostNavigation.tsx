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
      className="mt-12 grid gap-6 sm:grid-cols-2"
    >
      {/* 이전 글 (더 오래된 글) */}
      {prevPostMeta ? (
        <Link
          href={`/posts/${prevPostMeta.slug}`}
          className="group flex flex-col gap-1"
        >
          <span className="caption-2 text-text-muted">이전 글</span>
          <span className="line-clamp-2 title-3 text-text-primary transition-colors group-hover:text-accent-primary">
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
          className="group flex flex-col gap-1 sm:col-start-2 sm:text-right"
        >
          <span className="caption-2 text-text-muted">다음 글</span>
          <span className="line-clamp-2 title-3 text-text-primary transition-colors group-hover:text-accent-primary">
            {nextPostMeta.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
