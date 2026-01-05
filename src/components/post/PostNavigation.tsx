import Link from "next/link";
import type { Post } from "@/lib/content";

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="mt-12 grid gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:grid-cols-2">
      {/* 이전 글 (더 오래된 글) */}
      {prevPost ? (
        <Link
          href={`/posts/${prevPost.slug}`}
          className="group flex flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
        >
          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            이전 글
          </span>
          <span className="mt-2 line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {prevPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {/* 다음 글 (더 최신 글) */}
      {nextPost ? (
        <Link
          href={`/posts/${nextPost.slug}`}
          className="group flex flex-col rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900 sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1 text-sm text-gray-500 dark:text-gray-400">
            다음 글
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </span>
          <span className="mt-2 line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {nextPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
