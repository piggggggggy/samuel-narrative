import Link from "next/link";
import type { PostMeta } from "@/lib/content/types";
import { CATEGORY_LABELS } from "@/lib/schemas";

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
    <article className="group -mx-4 rounded-xl p-4 glass-card">
      <Link href={`/posts/${post.slug}`} className="block">
        <h2 className="text-xl font-semibold text-text-primary transition-colors duration-200 group-hover:text-accent-primary">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-text-secondary">
          {post.excerpt}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-accent-primary">
            {CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted">
            {formattedDate} · {readingTime}분 읽기
          </span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full px-2 py-0.5 text-xs text-tag-text glass-tag"
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
