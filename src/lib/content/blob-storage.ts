/**
 * Vercel Blob 기반 인덱스 스토리지
 * API Route에서만 호출되어 Turbopack의 page context와 분리됨
 */
import { put, list } from "@vercel/blob";
import type { PostsIndex } from "@/lib/schemas";

const BLOB_INDEX_KEY = "posts-index.json";

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
    contentType: "application/json",
  });
}
