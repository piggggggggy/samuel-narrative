import Link from "next/link";
import type { Post } from "@/lib/content";
import { getReadingTimeMinutes } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = getReadingTimeMinutes(post.content);

  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.thumbnail && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
          {post.excerpt}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <time
          dateTime={post.publishedAt}
          className="text-sm text-gray-500 dark:text-gray-500"
        >
          {formattedDate}
        </time>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="text-sm text-gray-500 dark:text-gray-500">
          {readingTime}분 읽기
        </span>
        {post.tags.length > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
