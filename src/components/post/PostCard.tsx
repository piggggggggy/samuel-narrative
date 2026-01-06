import Link from "next/link";
import type { PostMeta } from "@/lib/content/types";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = post.readingTime ?? 1;

  return (
    <article className="group -mx-4 rounded-xl p-4 transition-all duration-200 hover:bg-bg-secondary">
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
        <h2 className="text-xl font-semibold text-text-primary transition-colors duration-200 group-hover:text-accent-primary">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-text-secondary">
          {post.excerpt}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-xs text-text-muted">
          {formattedDate} · {readingTime}분 읽기
        </span>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text transition-colors hover:bg-tag-bg-hover"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
