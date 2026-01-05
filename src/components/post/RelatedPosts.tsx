import Link from "next/link";
import type { Post } from "@/lib/content";

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-border-default pt-8">
      <h2 className="mb-6 text-xl font-semibold text-text-primary">
        관련 포스트
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group rounded-lg border border-border-default p-4 transition-colors hover:border-border-muted hover:bg-bg-secondary"
          >
            <h3 className="line-clamp-2 font-medium text-text-primary transition-colors group-hover:text-accent-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
              {post.excerpt}
            </p>
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
