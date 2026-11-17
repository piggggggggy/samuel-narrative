"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PostForm } from "@/components/admin";
import { ConfirmModal, PostFormSkeleton } from "@/components/common";
import type { Post } from "@/lib/content/types";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("포스트를 찾을 수 없습니다.");
          }
          throw new Error("포스트를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다."
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PostFormSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <div role="alert" className="notice-danger body-6">
          {error}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="button-secondary button-sm"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3">
        <h1 className="heading-5 text-text-primary">포스트 수정</h1>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="button-danger button-sm"
        >
          삭제
        </button>
      </div>

      <PostForm post={post} mode="edit" />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="포스트 삭제"
        message={`"${post.title}" 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
