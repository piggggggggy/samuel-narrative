import Link from "next/link";
import type { PostMeta } from "@/lib/content";

interface RelatedPostsProps {
  postMetas: PostMeta[];
}

export function RelatedPosts({ postMetas }: RelatedPostsProps) {
  if (postMetas.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-border-default pt-8">
      <h2 className="mb-6 text-xl font-semibold text-text-primary">
        관련 포스트
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postMetas.map((postMeta) => (
          <Link
            key={postMeta.slug}
            href={`/posts/${postMeta.slug}`}
            className="group rounded-xl p-4 glass-card"
          >
            <h3 className="line-clamp-2 font-medium text-text-primary transition-colors group-hover:text-accent-primary">
              {postMeta.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
              {postMeta.excerpt}
            </p>
            {postMeta.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {postMeta.tags.slice(0, 3).map((tag) => (
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
