"use client";

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
    <div className="space-y-4">
      {/* 검색 및 새 글 버튼 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="포스트 검색..."
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          새 포스트
        </Link>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                제목
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                태그
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                작성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {filteredPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {search ? "검색 결과가 없습니다." : "포스트가 없습니다."}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {post.excerpt}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        수정
                      </Link>
                      <span className="text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        target="_blank"
                      >
                        보기
                      </Link>
                      <span className="text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {search
            ? `${filteredPosts.length}개의 검색 결과`
            : `총 ${filteredPosts.length}개의 포스트`}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
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
