"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PostRow } from "./PostRow";
import { Spinner } from "@/components/common";
import type { PostMeta, Category } from "@/lib/content/types";

interface TagCount {
  name: string;
  count: number;
}

interface InfinitePostListProps {
  initialPosts: PostMeta[];
  allTags?: TagCount[];
  category?: Category; // 고정된 카테고리 (카테고리 페이지에서 사용)
  postsPerPage?: number;
  emptyMessage?: string;
  maxFilterTags?: number;
}

export function InfinitePostList({
  initialPosts,
  allTags = [],
  category,
  postsPerPage = 10,
  emptyMessage = "아직 작성된 포스트가 없습니다.",
  maxFilterTags = 6,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostMeta[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= postsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // 상위 태그만 표시
  const topTags = allTags
    .sort((a, b) => b.count - a.count)
    .slice(0, maxFilterTags);

  // API URL 생성 헬퍼
  const buildApiUrl = useCallback(
    (pageNum: number, tag: string | null) => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(postsPerPage));
      if (tag) params.set("tag", tag);
      if (category) params.set("category", category);
      return `/api/posts?${params.toString()}`;
    },
    [postsPerPage, category]
  );

  // 태그 선택 핸들러
  const handleTagSelect = useCallback(
    async (tag: string | null) => {
      setSelectedTag(tag);
      setPage(1);
      setIsLoading(true);
      setHasError(false);

      try {
        const url = buildApiUrl(1, tag);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        setPosts(data.posts || []);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Failed to load posts:", error);
        // 이전 필터의 목록이 남지 않게 비우고, 다시 시도는 같은 태그로 처음부터 부른다
        setPosts([]);
        setHasMore(false);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [buildApiUrl]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setHasError(false);
    try {
      const url = buildApiUrl(page + 1, selectedTag);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, buildApiUrl, selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 실패한 뒤에는 자동으로 다시 부르지 않고 버튼으로만 재시도한다
        if (entries[0].isIntersecting && hasMore && !isLoading && !hasError) {
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
  }, [loadMore, hasMore, isLoading, hasError]);

  const showTagFilter = allTags.length > 0;

  // 빈 상태 메시지 생성
  const getEmptyMessage = () => {
    if (selectedTag) {
      return `"${selectedTag}" 태그가 붙은 글이 없습니다.`;
    }
    return emptyMessage;
  };

  const filterClass = (selected: boolean) =>
    `inline-flex min-h-11 items-center caption-1 underline-offset-8 transition-colors md:min-h-8 ${
      selected
        ? "text-text-primary underline"
        : "text-text-muted hover:text-text-primary"
    }`;

  return (
    <div className="flex flex-col gap-8">
      {/* 태그 필터 */}
      {showTagFilter && (
        <div
          role="group"
          aria-label="태그로 걸러 보기"
          className="flex flex-wrap items-center gap-x-5"
        >
          <button
            type="button"
            aria-pressed={selectedTag === null}
            onClick={() => handleTagSelect(null)}
            className={filterClass(selectedTag === null)}
          >
            전체
          </button>
          {topTags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              aria-pressed={selectedTag === tag.name}
              onClick={() => handleTagSelect(tag.name)}
              className={filterClass(selectedTag === tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* 글 목록 */}
      {posts.length === 0 && !hasError ? (
        <p className="py-6 body-3 text-text-muted">{getEmptyMessage()}</p>
      ) : (
        <ul>
          {posts.map((post, index) => (
            <li key={post.slug}>
              {index > 0 && (
                <div aria-hidden="true" className="h-px bg-border-default" />
              )}
              <PostRow post={post} showCategory={!category} />
            </li>
          ))}
        </ul>
      )}

      {/* 로딩 트리거 영역 */}
      <div
        ref={observerRef}
        className="flex min-h-16 flex-col items-center justify-center gap-3"
      >
        {isLoading && <Spinner size="lg" />}
        {hasError && !isLoading && (
          <div role="alert" className="flex flex-col items-center gap-3">
            <p className="body-6 text-text-secondary">
              글을 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해
              주세요.
            </p>
            <button
              type="button"
              onClick={() =>
                posts.length === 0 ? handleTagSelect(selectedTag) : loadMore()
              }
              className="button-primary button-sm"
            >
              다시 시도
            </button>
          </div>
        )}
        {!hasMore && !hasError && posts.length > 0 && (
          <p className="caption-2 text-text-muted">
            마지막 글까지 다 보셨습니다
          </p>
        )}
      </div>
    </div>
  );
}
