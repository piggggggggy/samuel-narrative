import type { PostMeta } from "@/lib/content";
import { PostRow } from "./PostRow";

interface RelatedPostsProps {
  postMetas: PostMeta[];
}

export function RelatedPosts({ postMetas }: RelatedPostsProps) {
  if (postMetas.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="caption-1 text-text-muted">
        관련 글
      </h2>
      <ul className="mt-2">
        {postMetas.map((postMeta, index) => (
          <li key={postMeta.slug}>
            {index > 0 && (
              <div aria-hidden="true" className="h-px bg-border-default" />
            )}
            <PostRow post={postMeta} />
          </li>
        ))}
      </ul>
    </section>
  );
}
