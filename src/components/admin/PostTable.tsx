"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConfirmModal } from "@/components/common";
import type { Post } from "@/lib/content/types";

interface PostTableProps {
  posts: Post[];
}

export function PostTable({ posts }: PostTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${deleteTarget.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;

    const query = search.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [posts, search]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 및 새 글 버튼 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="search"
            aria-label="포스트 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 요약, 태그로 검색"
            className="field pl-10 body-6"
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
        </div>
        <Link href="/admin/posts/new" className="button-primary button-sm">
          <PlusIcon aria-hidden="true" className="h-4 w-4" />새 포스트
        </Link>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-border-default">
        <table className="min-w-full divide-y divide-border-default">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left caption-4 text-text-secondary">
                제목
              </th>
              <th className="hidden px-4 py-3 text-left caption-4 text-text-secondary sm:table-cell">
                태그
              </th>
              <th className="hidden px-4 py-3 text-left caption-4 text-text-secondary md:table-cell">
                작성일
              </th>
              <th className="px-4 py-3 text-right caption-4 text-text-secondary">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default bg-bg-primary">
            {filteredPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center body-6 text-text-muted"
                >
                  {search ? "검색 결과가 없습니다." : "포스트가 없습니다."}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  className="transition-colors hover:bg-bg-secondary"
                >
                  <td className="px-4 py-4">
                    <div>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="title-3 text-text-primary transition-colors hover:text-accent-primary"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 line-clamp-1 body-6 text-text-secondary">
                        {post.excerpt}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-tag-bg px-2 py-0.5 caption-4 text-tag-text"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="caption-5 text-text-muted">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-4 caption-2 text-text-secondary md:table-cell">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 caption-1">
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="rounded-lg px-2 py-2 text-text-primary transition-colors hover:bg-bg-tertiary"
                      >
                        수정
                      </Link>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="rounded-lg px-2 py-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                        target="_blank"
                      >
                        보기
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="rounded-lg px-2 py-2 text-danger transition-colors hover:bg-bg-tertiary"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 결과 수 */}
      {filteredPosts.length > 0 && (
        <p className="caption-2 text-text-muted">
          {search
            ? `${filteredPosts.length}개의 검색 결과`
            : `총 ${filteredPosts.length}개의 포스트`}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div
          role="alert"
          className="notice-danger flex items-center justify-between gap-3 body-6"
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="body-4 underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="포스트 삭제"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ""
        }
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
