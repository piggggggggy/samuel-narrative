import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

// No write/delete capability is accepted by the reporting workflow.
export interface BlobReader {
  list(options: {
    prefix: string;
    limit: number;
    cursor?: string;
  }): Promise<unknown>;
  head(url: string): Promise<unknown>;
}

const blobSchema = z.object({
  url: z.url(),
  pathname: z.string().min(1),
  size: z.number().int().nonnegative(),
  uploadedAt: z.date(),
});
const pageSchema = z.object({
  blobs: z.array(blobSchema),
  hasMore: z.boolean(),
  cursor: z.string().min(1).optional(),
});
const metadataSchema = blobSchema.extend({ contentType: z.string() });
const imageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;

export function assertDryRunArgs(args: string[]): void {
  if (args.some((arg) => arg !== "--dry-run")) {
    throw new Error(
      "Image cleanup is report-only; only --dry-run is supported."
    );
  }
}

function normalizeUrl(value: string): string {
  const url = new URL(value);
  return `${url.origin}${decodeURI(url.pathname)}`;
}

function readContentSnapshot(directory: string) {
  const digest = createHash("sha256");
  const usedUrls = new Set<string>();
  let postsScanned = 0;

  function collectUrls(text: string) {
    const matches =
      text.match(
        /https:\/\/[a-zA-Z0-9.-]+\.public\.blob\.vercel-storage\.com\/[^\s<>()[\]"']+/g
      ) || [];
    for (const match of matches) usedUrls.add(normalizeUrl(match));
  }

  function collectMetadata(value: unknown): void {
    if (typeof value === "string") collectUrls(value);
    else if (Array.isArray(value)) value.forEach(collectMetadata);
    else if (value && typeof value === "object")
      Object.values(value).forEach(collectMetadata);
  }

  function visit(current: string) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink())
      throw new Error("Symlinked content is not supported");
    if (!stat.isDirectory()) throw new Error("Content directory is required");
    for (const entry of readdirSync(current, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name)
    )) {
      const filename = path.join(current, entry.name);
      if (entry.isSymbolicLink())
        throw new Error("Symlinked content is not supported");
      if (entry.isDirectory()) visit(filename);
      else if (entry.name.endsWith(".md")) {
        if (!entry.isFile()) throw new Error("Invalid content file");
        const text = readFileSync(filename, "utf8");
        const { data } = matter(text);
        digest.update(
          JSON.stringify([path.relative(directory, filename), text])
        );
        collectUrls(text);
        collectMetadata(data);
        postsScanned++;
      }
    }
  }

  try {
    visit(directory);
  } catch {
    throw new Error("Content scan failed; no cleanup report was produced.");
  }
  if (postsScanned === 0)
    throw new Error("No Markdown content found; refusing cleanup report.");
  return { fingerprint: digest.digest("hex"), usedUrls, postsScanned };
}

function validateIdentity(blob: z.infer<typeof blobSchema>) {
  const url = new URL(blob.url);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !/^[a-zA-Z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname) ||
    url.search ||
    url.hash ||
    decodeURIComponent(url.pathname.slice(1)) !== blob.pathname
  ) {
    throw new Error("Invalid Blob object identity; refusing cleanup report.");
  }
}

async function listAllBlobs(reader: BlobReader) {
  const blobs: z.infer<typeof blobSchema>[] = [];
  const cursors = new Set<string>();
  const identities = new Set<string>();
  let cursor: string | undefined;
  for (let pageNumber = 0; pageNumber < 100; pageNumber++) {
    let raw: unknown;
    try {
      raw = await reader.list({ prefix: "uploads/", limit: 1000, cursor });
    } catch {
      throw new Error(
        "Blob listing failed; no partial cleanup report was produced."
      );
    }
    const result = pageSchema.safeParse(raw);
    if (!result.success)
      throw new Error("Invalid Blob listing; refusing cleanup report.");
    const page = result.data;
    for (const blob of page.blobs) {
      validateIdentity(blob);
      if (identities.has(blob.url))
        throw new Error("Duplicate Blob in listing; refusing cleanup report.");
      identities.add(blob.url);
      blobs.push(blob);
    }
    if (blobs.length > 10000)
      throw new Error("Blob inventory exceeds reporting limit.");
    if (!page.hasMore) return blobs;
    if (!page.cursor || cursors.has(page.cursor)) {
      throw new Error(
        "Incomplete or cyclic Blob pagination; refusing cleanup report."
      );
    }
    cursors.add(page.cursor);
    cursor = page.cursor;
  }
  throw new Error("Blob pagination exceeds reporting limit.");
}

export async function createCleanupReport(
  directory: string,
  reader: BlobReader,
  now = new Date()
) {
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid report time");
  const snapshot = readContentSnapshot(directory);
  const blobs = await listAllBlobs(reader);
  const candidates: {
    url: string;
    pathname: string;
    uploadedAt: string;
    size: number;
  }[] = [];
  const protectedCounts = {
    outOfScope: 0,
    referenced: 0,
    recent: 0,
    notImage: 0,
  };

  for (const blob of blobs) {
    // The uploader writes flat, sanitized filenames under uploads/.
    if (
      !blob.pathname.startsWith("uploads/") ||
      !/^uploads\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|gif|webp|svg)$/i.test(
        blob.pathname
      )
    ) {
      protectedCounts.outOfScope++;
      continue;
    }
    if (snapshot.usedUrls.has(normalizeUrl(blob.url))) {
      protectedCounts.referenced++;
      continue;
    }
    if (now.getTime() - blob.uploadedAt.getTime() < gracePeriodMs) {
      protectedCounts.recent++;
      continue;
    }
    let raw: unknown;
    try {
      raw = await reader.head(blob.url);
    } catch {
      throw new Error(
        "Blob metadata lookup failed; no cleanup report was produced."
      );
    }
    const parsed = metadataSchema.safeParse(raw);
    if (!parsed.success)
      throw new Error("Invalid Blob metadata; refusing cleanup report.");
    const metadata = parsed.data;
    if (
      metadata.url !== blob.url ||
      metadata.pathname !== blob.pathname ||
      metadata.size !== blob.size ||
      metadata.uploadedAt.getTime() !== blob.uploadedAt.getTime()
    ) {
      throw new Error(
        "Blob changed during inspection; refusing cleanup report."
      );
    }
    if (
      !imageTypes.has(metadata.contentType.toLowerCase().split(";")[0].trim())
    ) {
      protectedCounts.notImage++;
      continue;
    }
    candidates.push({ ...blob, uploadedAt: blob.uploadedAt.toISOString() });
  }

  if (readContentSnapshot(directory).fingerprint !== snapshot.fingerprint) {
    throw new Error(
      "Content changed during inspection; refusing cleanup report."
    );
  }
  return {
    mode: "dry-run" as const,
    source: "local-checkout" as const,
    contentFingerprint: snapshot.fingerprint,
    generatedAt: now.toISOString(),
    gracePeriodDays: 7,
    postsScanned: snapshot.postsScanned,
    blobsScanned: blobs.length,
    protectedCounts,
    candidates,
  };
}
