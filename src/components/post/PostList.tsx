import type { PostMeta } from "@/lib/content/types";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = "아직 작성된 포스트가 없습니다.",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:gap-6">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
