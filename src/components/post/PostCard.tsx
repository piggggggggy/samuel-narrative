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
        <h2 className="text-xl font-semibold text-text-primary transition-colors group-hover:text-accent-primary">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-text-secondary">
          {post.excerpt}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <time
          dateTime={post.publishedAt}
          className="text-sm text-text-muted"
        >
          {formattedDate}
        </time>
        <span className="text-border-default">·</span>
        <span className="text-sm text-text-muted">
          {readingTime}분 읽기
        </span>
        {post.tags.length > 0 && (
          <>
            <span className="text-border-default">·</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="rounded-full bg-tag-bg px-2.5 py-0.5 text-sm text-tag-text transition-colors hover:bg-tag-bg-hover"
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
