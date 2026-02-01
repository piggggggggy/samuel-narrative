/**
 * Vercel Blob 스토리지 통합 모듈
 * @vercel/blob 호출을 한 곳에서 관리하여 의존성을 격리
 */
import { put, list } from "@vercel/blob";
import type { PutBlobResult } from "@vercel/blob";
import type { PostsIndex } from "@/lib/schemas";

const BLOB_INDEX_KEY = "posts-index.json";

// --- Index 관련 ---

export async function loadIndexFromBlob(): Promise<PostsIndex | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_INDEX_KEY, limit: 1 });
    if (blobs.length === 0) return null;

    const response = await fetch(blobs[0].downloadUrl);
    if (!response.ok) return null;

    return (await response.json()) as PostsIndex;
  } catch {
    return null;
  }
}

export async function saveIndexToBlob(index: PostsIndex): Promise<void> {
  await put(BLOB_INDEX_KEY, JSON.stringify(index, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// --- 파일 업로드 ---

export async function uploadFileToBlob(
  pathname: string,
  file: File | Blob,
): Promise<PutBlobResult> {
  return put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });
}
