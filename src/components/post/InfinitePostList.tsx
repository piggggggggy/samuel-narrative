"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { CategoryFilter, buildCategoryCounts } from "./CategoryFilter";
import { Spinner } from "@/components/common";
import type { PostMeta, Category } from "@/lib/content/types";

interface TagCount {
  name: string;
  count: number;
}

interface InfinitePostListProps {
  initialPosts: PostMeta[];
  allTags?: TagCount[];
  allPosts?: PostMeta[]; // 카테고리 카운트 계산용
  initialCategory?: Category | null;
  postsPerPage?: number;
  emptyMessage?: string;
  maxFilterTags?: number;
}

export function InfinitePostList({
  initialPosts,
  allTags = [],
  allPosts,
  initialCategory = null,
  postsPerPage = 10,
  emptyMessage = "아직 작성된 포스트가 없습니다.",
  maxFilterTags = 6,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostMeta[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= postsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const observerRef = useRef<HTMLDivElement>(null);

  // 카테고리 카운트 계산 (전체 포스트 기준)
  const categoryCounts = buildCategoryCounts(allPosts || initialPosts);
  const totalPostCount = allPosts?.length || initialPosts.length;

  // 상위 태그만 표시
  const topTags = allTags
    .sort((a, b) => b.count - a.count)
    .slice(0, maxFilterTags);

  // API URL 생성 헬퍼
  const buildApiUrl = useCallback(
    (pageNum: number, tag: string | null, category: Category | null) => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(postsPerPage));
      if (tag) params.set("tag", tag);
      if (category) params.set("category", category);
      return `/api/posts?${params.toString()}`;
    },
    [postsPerPage]
  );

  // 필터 변경 시 포스트 목록 초기화 및 다시 로드
  const handleFilterChange = useCallback(
    async (tag: string | null, category: Category | null) => {
      setSelectedTag(tag);
      setSelectedCategory(category);
      setPage(1);
      setIsLoading(true);

      try {
        const url = buildApiUrl(1, tag, category);
        const response = await fetch(url);
        const data = await response.json();

        setPosts(data.posts || []);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [buildApiUrl]
  );

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback(
    (category: Category | null) => {
      handleFilterChange(selectedTag, category);
    },
    [handleFilterChange, selectedTag]
  );

  // 태그 선택 핸들러
  const handleTagSelect = useCallback(
    (tag: string | null) => {
      handleFilterChange(tag, selectedCategory);
    },
    [handleFilterChange, selectedCategory]
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const url = buildApiUrl(page + 1, selectedTag, selectedCategory);
      const response = await fetch(url);
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
  }, [page, isLoading, hasMore, buildApiUrl, selectedTag, selectedCategory]);

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

  const showTagFilter = allTags.length > 0;
  const showCategoryFilter = categoryCounts.length > 0;

  // 빈 상태 메시지 생성
  const getEmptyMessage = () => {
    if (selectedCategory && selectedTag) {
      return `"${selectedTag}" 태그의 포스트가 없습니다.`;
    }
    if (selectedCategory) {
      return `이 카테고리에 포스트가 없습니다.`;
    }
    if (selectedTag) {
      return `"${selectedTag}" 태그의 포스트가 없습니다.`;
    }
    return emptyMessage;
  };

  return (
    <div>
      {/* 카테고리 필터 */}
      {showCategoryFilter && (
        <CategoryFilter
          categories={categoryCounts}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          totalCount={totalPostCount}
        />
      )}

      {/* 태그 필터 */}
      {showTagFilter && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTagSelect(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTag === null
                ? "bg-accent-primary text-text-inverted"
                : "bg-tag-bg text-tag-text hover:bg-tag-bg-hover"
            }`}
          >
            전체
          </button>
          {topTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagSelect(tag.name)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedTag === tag.name
                  ? "bg-accent-primary text-text-inverted"
                  : "bg-tag-bg text-tag-text hover:bg-tag-bg-hover"
              }`}
            >
              {tag.name}
            </button>
          ))}
          {allTags.length > maxFilterTags && (
            <Link
              href="/tags"
              className="ml-1 text-sm text-text-muted transition-colors hover:text-accent-primary"
            >
              모든 태그 →
            </Link>
          )}
        </div>
      )}

      {/* 포스트 목록 */}
      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-text-muted">{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="grid gap-8 md:gap-10">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* 로딩 트리거 영역 */}
      <div
        ref={observerRef}
        className="flex h-20 items-center justify-center"
      >
        {isLoading && <Spinner size="lg" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-text-muted">
            모든 포스트를 불러왔습니다
          </p>
        )}
      </div>
    </div>
  );
}
