/**
 * Vercel Blob 스토리지 통합 모듈
 * @vercel/blob 호출을 한 곳에서 관리하여 의존성을 격리
 */
import { put } from "@vercel/blob";
import type { PutBlobResult } from "@vercel/blob";

export async function uploadFileToBlob(
  pathname: string,
  file: File | Blob
): Promise<PutBlobResult> {
  return put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });
}
