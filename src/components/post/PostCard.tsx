import Link from "next/link";
import type { PostMeta } from "@/lib/content/types";
import { CATEGORY_LABELS } from "@/lib/schemas";

interface PostCardProps {
  post: PostMeta;
  /** 홈의 대표 글처럼 크게 보여줄 때 */
  featured?: boolean;
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const readingTime = post.readingTime ?? 1;

  return (
    <article
      className={`group relative rounded-2xl glass-card ${
        featured ? "p-6 md:p-8" : "p-6"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 caption-4 text-text-muted">
        <span className="caption-3 text-accent-primary">
          {CATEGORY_LABELS[post.category]}
        </span>
        <time dateTime={post.publishedAt}>
          {formatPostDate(post.publishedAt)}
        </time>
        <span>{readingTime}분 읽기</span>
      </div>

      <h3
        className={`mt-3 text-text-primary ${
          featured ? "heading-5 md:heading-4" : "heading-6"
        }`}
      >
        {/* 카드 전체가 링크로 동작한다 */}
        <Link
          href={`/posts/${post.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl"
        >
          {post.title}
        </Link>
      </h3>

      <p
        className={`mt-2 line-clamp-2 text-text-secondary ${
          featured ? "body-3 md:title-2" : "body-3"
        }`}
      >
        {post.excerpt}
      </p>

      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-tag-bg px-3 py-1 caption-4 text-tag-text"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
