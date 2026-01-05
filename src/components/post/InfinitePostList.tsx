"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import type { Post } from "@/lib/content/types";

interface InfinitePostListProps {
  initialPosts: Post[];
  postsPerPage?: number;
  emptyMessage?: string;
}

export function InfinitePostList({
  initialPosts,
  postsPerPage = 10,
  emptyMessage = "아직 작성된 포스트가 없습니다.",
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= postsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?page=${page + 1}&limit=${postsPerPage}`
      );
      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setHasMore(data.hasMore);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, postsPerPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-8 md:gap-10">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* 로딩 트리거 영역 */}
      <div
        ref={observerRef}
        className="flex h-20 items-center justify-center"
      >
        {isLoading && (
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            모든 포스트를 불러왔습니다
          </p>
        )}
      </div>
    </div>
  );
}
