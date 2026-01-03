import type { Post } from "@/lib/content";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = "아직 작성된 포스트가 없습니다.",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:gap-10">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
