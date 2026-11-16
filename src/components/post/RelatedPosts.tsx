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
    <section aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="mb-6 heading-6 text-text-primary">
        관련 글
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postMetas.map((postMeta) => (
          <Link
            key={postMeta.slug}
            href={`/posts/${postMeta.slug}`}
            className="flex flex-col gap-2 rounded-2xl p-4 glass-card"
          >
            <h3 className="line-clamp-2 title-3 text-text-primary">
              {postMeta.title}
            </h3>
            <p className="line-clamp-2 body-6 text-text-secondary">
              {postMeta.excerpt}
            </p>
            {postMeta.tags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1 pt-2">
                {postMeta.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-tag-bg px-2 py-0.5 caption-4 text-tag-text"
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
