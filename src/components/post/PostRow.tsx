import Link from "next/link";
import type { PostMeta } from "@/lib/content/types";
import { CATEGORY_LABELS } from "@/lib/schemas";

interface PostRowProps {
  post: PostMeta;
  /** 한 주제의 글만 모은 목록에서는 주제 이름을 뺀다 */
  showCategory?: boolean;
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 목록의 글 한 줄: 테두리나 배경 없이 제목, 요약, 날짜만 보여준다.
 */
export function PostRow({ post, showCategory = true }: PostRowProps) {
  return (
    <article className="group relative flex flex-col gap-2 py-6">
      <h3 className="title-2 text-text-primary transition-colors group-hover:text-accent-primary">
        {/* 줄 전체가 링크로 동작한다 */}
        <Link
          href={`/posts/${post.slug}`}
          className="after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h3>
      <p className="line-clamp-2 max-w-2xl body-6 text-text-secondary">
        {post.excerpt}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 caption-5 text-text-muted">
        {showCategory && <span>{CATEGORY_LABELS[post.category]}</span>}
        <time dateTime={post.publishedAt}>
          {formatPostDate(post.publishedAt)}
        </time>
      </div>
    </article>
  );
}
