import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test, type TestContext } from "node:test";
import { spawnSync } from "node:child_process";
import {
  createCleanupReport,
  assertDryRunArgs,
  type BlobReader,
} from "./image-cleanup";

const now = new Date("2026-09-06T00:00:00Z");
const origin = "https://example.public.blob.vercel-storage.com";

function blob(name: string, uploadedAt = "2026-08-01T00:00:00Z") {
  return {
    url: `${origin}/${name}`,
    downloadUrl: `${origin}/${name}?download=1`,
    pathname: name,
    size: 100,
    uploadedAt: new Date(uploadedAt),
  };
}

function fixture(t: TestContext, text = "---\ntitle: Example\n---\nBody") {
  const directory = mkdtempSync(path.join(tmpdir(), "image-cleanup-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(path.join(directory, "post.md"), text);
  return directory;
}

function reader(blobs = [blob("uploads/orphan.png")]): BlobReader {
  return {
    async list() {
      return { blobs, hasMore: false };
    },
    async head(url) {
      const item = blobs.find((b) => b.url === url);
      assert.ok(item, "Only listed objects may be inspected");
      return {
        ...item,
        contentType: "image/png",
        contentDisposition: "inline",
        cacheControl: "public, max-age=31536000",
      };
    },
  };
}

test("default and legacy dry-run arguments cannot enable deletion", () => {
  assert.doesNotThrow(() => assertDryRunArgs([]));
  assert.doesNotThrow(() => assertDryRunArgs(["--dry-run"]));
  for (const arg of ["--execute", "--delete", "--dry-run=false", "--unknown"]) {
    assert.throws(() => assertDryRunArgs([arg]), /report-only/i);
  }
});

test("CLI rejects deletion flags before authentication and fails closed without a token", () => {
  for (const args of [[], ["--dry-run"], ["--execute"]]) {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/cleanup-orphan-images.ts", ...args],
      {
        cwd: process.cwd(),
        env: { ...process.env, BLOB_READ_WRITE_TOKEN: "" },
        encoding: "utf8",
        timeout: 5000,
      }
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      args.includes("--execute")
        ? /report-only/
        : /BLOB_READ_WRITE_TOKEN is required/
    );
  }
});

test("protects index, non-image paths, references, and uploads less than seven days old", async (t) => {
  const directory = fixture(
    t,
    `---\ntitle: Example\ncover: "${origin}/uploads/cover.png"\n---\n![used](${origin}/uploads/used.png?w=1#h=2)`
  );
  const blobs = [
    blob("posts-index.json"),
    blob("archive/old.png"),
    blob("Uploads/not-our-prefix.png"),
    blob("uploads/data.json"),
    blob("uploads/used.png"),
    blob("uploads/cover.png"),
    blob("uploads/recent.png", "2026-08-30T00:00:01Z"),
    blob("uploads/boundary.png", "2026-08-30T00:00:00Z"),
    blob("uploads/orphan.png"),
  ];
  const report = await createCleanupReport(directory, reader(blobs), now);
  assert.equal(report.mode, "dry-run");
  assert.deepEqual(
    report.candidates.map((b) => b.pathname),
    ["uploads/boundary.png", "uploads/orphan.png"]
  );
  assert.equal(report.postsScanned, 1);
  assert.equal(report.blobsScanned, 9);
});

test("collects nested Markdown references before identifying candidates", async (t) => {
  const directory = fixture(t);
  mkdirSync(path.join(directory, "nested"));
  writeFileSync(
    path.join(directory, "nested/post.md"),
    `![image](<${origin}/uploads/orphan.png>)`
  );
  const report = await createCleanupReport(directory, reader(), now);
  assert.equal(report.postsScanned, 2);
  assert.deepEqual(report.candidates, []);
});

test("reads every Blob page using the returned cursor", async (t) => {
  const directory = fixture(t);
  const first = blob("uploads/first.png");
  const second = blob("uploads/second.png");
  const storage = reader([first, second]);
  storage.list = async ({ cursor, prefix, limit }) => {
    assert.equal(prefix, "uploads/");
    assert.equal(limit, 1000);
    if (cursor === undefined)
      return { blobs: [first], hasMore: true, cursor: "next" };
    assert.equal(cursor, "next");
    return { blobs: [second], hasMore: false };
  };
  const report = await createCleanupReport(directory, storage, now);
  assert.deepEqual(
    report.candidates.map((b) => b.pathname),
    ["uploads/first.png", "uploads/second.png"]
  );
});

test("does not return a partial report if a later page fails", async (t) => {
  const directory = fixture(t);
  const storage = reader();
  storage.list = async ({ cursor }) => {
    if (!cursor)
      return {
        blobs: [blob("uploads/orphan.png")],
        hasMore: true,
        cursor: "next",
      };
    throw new Error("fixture outage");
  };
  await assert.rejects(
    createCleanupReport(directory, storage, now),
    /Blob listing failed/
  );
});

test("rejects incomplete or cyclic pagination and duplicate objects", async (t) => {
  const directory = fixture(t);
  for (const page of [
    { blobs: [], hasMore: true },
    { blobs: [], hasMore: true, cursor: "repeat" },
    { blobs: [blob("uploads/a.png"), blob("uploads/a.png")], hasMore: false },
    { blobs: [], hasMore: "false" },
  ]) {
    await assert.rejects(
      createCleanupReport(
        directory,
        { ...reader(), list: async () => page },
        now
      )
    );
  }
});

test("rejects missing, empty, malformed, and symlinked content", async (t) => {
  const root = fixture(t);
  const storage = reader();
  await assert.rejects(
    createCleanupReport(path.join(root, "missing"), storage, now),
    /content/i
  );
  const empty = path.join(root, "empty");
  mkdirSync(empty);
  await assert.rejects(createCleanupReport(empty, storage, now), /No Markdown/);
  writeFileSync(path.join(root, "post.md"), "---\ntitle: [\n---");
  await assert.rejects(createCleanupReport(root, storage, now), /content/i);
  const linked = path.join(root, "linked");
  symlinkSync(empty, linked);
  await assert.rejects(createCleanupReport(linked, storage, now), /content/i);
});

test("rejects invalid dates and mismatched object identities", async (t) => {
  const directory = fixture(t);
  for (const item of [
    { ...blob("uploads/a.png"), uploadedAt: new Date("invalid") },
    { ...blob("uploads/a.png"), url: `${origin}/uploads/b.png` },
    { ...blob("uploads/a.png"), url: "https://example.com/uploads/a.png" },
  ]) {
    await assert.rejects(createCleanupReport(directory, reader([item]), now));
  }
});

test("checks content type instead of trusting a .png extension", async (t) => {
  const directory = fixture(t);
  const storage = reader();
  const head = storage.head;
  storage.head = async (url) => ({
    ...((await head(url)) as object),
    contentType: "application/json",
  });
  const report = await createCleanupReport(directory, storage, now);
  assert.deepEqual(report.candidates, []);
});

test("aborts if object metadata cannot be read or changed since listing", async (t) => {
  const directory = fixture(t);
  const storage = reader();
  storage.head = async () => {
    throw new Error("fixture inaccessible");
  };
  await assert.rejects(
    createCleanupReport(directory, storage, now),
    /metadata/i
  );
  storage.head = async () => ({
    ...blob("uploads/orphan.png"),
    size: 200,
    contentType: "image/png",
  });
  await assert.rejects(
    createCleanupReport(directory, storage, now),
    /changed/i
  );
});

test("aborts if local content changes while Blob metadata is being checked", async (t) => {
  const directory = fixture(t);
  const storage = reader();
  const head = storage.head;
  storage.head = async (url) => {
    writeFileSync(
      path.join(directory, "post.md"),
      `![new reference](${origin}/uploads/orphan.png)`
    );
    return head(url);
  };
  await assert.rejects(
    createCleanupReport(directory, storage, now),
    /content changed/i
  );
});
