/**
 * 고아 이미지 정리 스크립트
 *
 * 모든 포스트를 스캔하여 사용되지 않는 Blob 이미지를 삭제합니다.
 * Vercel CLI를 사용하여 VERCEL_TOKEN 환경변수로 인증합니다.
 *
 * 사용법:
 *   pnpm images:cleanup          # 실제 삭제
 *   pnpm images:cleanup:dry      # 삭제 없이 프리뷰
 *
 * 환경변수:
 *   VERCEL_TOKEN - Vercel API 토큰 (CI/로컬 동일)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");
const BLOB_URL_PATTERN = /https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/[^\s)"'\]]+/g;

const isDryRun = process.argv.includes("--dry-run");

interface CleanupResult {
  totalBlobs: number;
  usedBlobs: number;
  orphanBlobs: string[];
  deletedCount: number;
  errors: string[];
}

/**
 * Vercel CLI 명령 실행
 */
function runVercelCommand(args: string): string {
  const token = process.env.VERCEL_TOKEN;
  const tokenArg = token ? ` --token "${token}"` : "";

  try {
    return execSync(`npx vercel ${args}${tokenArg}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    const execError = error as { stderr?: string; message?: string };
    throw new Error(execError.stderr || execError.message || "Unknown error");
  }
}

/**
 * 모든 포스트에서 사용 중인 이미지 URL 추출
 */
function getUsedImageUrls(): Set<string> {
  const usedUrls = new Set<string>();

  if (!fs.existsSync(POSTS_DIRECTORY)) {
    console.warn(`Posts directory not found: ${POSTS_DIRECTORY}`);
    return usedUrls;
  }

  const files = fs.readdirSync(POSTS_DIRECTORY).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(POSTS_DIRECTORY, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { content } = matter(fileContent);

    // content에서 Blob URL 추출
    const contentUrls = content.match(BLOB_URL_PATTERN) || [];
    contentUrls.forEach((url) => usedUrls.add(normalizeUrl(url)));
  }

  return usedUrls;
}

/**
 * URL 정규화 (fragment, query 제거)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("#")[0].split("?")[0];
  }
}

/**
 * Vercel Blob에서 모든 업로드된 파일 목록 조회
 */
function getAllBlobs(): { url: string; pathname: string }[] {
  const output = runVercelCommand("blob list --limit 1000");

  // URL 라인만 추출
  const lines = output.split("\n").filter((line) => line.startsWith("https://"));

  return lines.map((url) => ({
    url: url.trim(),
    pathname: new URL(url.trim()).pathname,
  }));
}

/**
 * 고아 이미지 삭제
 */
function deleteOrphanBlobs(urls: string[]): { deleted: number; errors: string[] } {
  let deleted = 0;
  const errors: string[] = [];

  for (const url of urls) {
    try {
      runVercelCommand(`blob del "${url}" --yes`);
      deleted++;
      console.log(`  ✓ Deleted: ${url}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${url}: ${msg}`);
      console.log(`  ✗ Failed: ${url} - ${msg}`);
    }
  }

  return { deleted, errors };
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ORPHAN IMAGE CLEANUP" + (isDryRun ? " (DRY RUN)" : ""));
  console.log("═══════════════════════════════════════════════════════════════\n");

  const result: CleanupResult = {
    totalBlobs: 0,
    usedBlobs: 0,
    orphanBlobs: [],
    deletedCount: 0,
    errors: [],
  };

  // 1. 사용 중인 이미지 URL 수집
  console.log("📂 Scanning posts for used images...");
  const usedUrls = getUsedImageUrls();
  console.log(`   Found ${usedUrls.size} image references in posts\n`);

  // 2. Blob 스토리지에서 전체 목록 조회
  console.log("☁️  Fetching blob storage list...");
  let allBlobs: { url: string; pathname: string }[];

  try {
    allBlobs = getAllBlobs();
  } catch (error) {
    console.error("\n❌ Failed to fetch blob list:", error);
    console.log("\nMake sure VERCEL_TOKEN is set correctly.");
    process.exit(1);
  }

  result.totalBlobs = allBlobs.length;
  console.log(`   Found ${allBlobs.length} blobs in storage\n`);

  // 3. 고아 이미지 식별
  console.log("🔍 Identifying orphan images...");
  for (const blob of allBlobs) {
    const normalizedUrl = normalizeUrl(blob.url);
    if (usedUrls.has(normalizedUrl)) {
      result.usedBlobs++;
    } else {
      result.orphanBlobs.push(blob.url);
    }
  }

  console.log(`   Used: ${result.usedBlobs}`);
  console.log(`   Orphans: ${result.orphanBlobs.length}\n`);

  // 4. 고아 이미지 삭제 (또는 프리뷰)
  if (result.orphanBlobs.length === 0) {
    console.log("✨ No orphan images found. Storage is clean!\n");
  } else {
    console.log("🗑️  Orphan images:");
    result.orphanBlobs.forEach((url) => {
      const pathname = url.split("/").slice(-2).join("/");
      console.log(`   - ${pathname}`);
    });
    console.log();

    if (isDryRun) {
      console.log("⚠️  DRY RUN - No images were deleted.\n");
      console.log("   Run without --dry-run to actually delete.\n");
    } else {
      console.log("🗑️  Deleting orphan images...");
      const { deleted, errors } = deleteOrphanBlobs(result.orphanBlobs);
      result.deletedCount = deleted;
      result.errors = errors;
      console.log();
    }
  }

  // 5. 요약
  console.log("───────────────────────────────────────────────────────────────");
  console.log("Summary:");
  console.log(`  Total blobs:  ${result.totalBlobs}`);
  console.log(`  Used:         ${result.usedBlobs}`);
  console.log(`  Orphans:      ${result.orphanBlobs.length}`);
  if (!isDryRun && result.orphanBlobs.length > 0) {
    console.log(`  Deleted:      ${result.deletedCount}`);
    if (result.errors.length > 0) {
      console.log(`  Errors:       ${result.errors.length}`);
    }
  }
  console.log("═══════════════════════════════════════════════════════════════\n");

  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
