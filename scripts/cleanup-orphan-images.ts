/** Read-only candidate report. Actual deletion is intentionally unavailable. */
import path from "node:path";
import { head, list } from "@vercel/blob";
import { assertDryRunArgs, createCleanupReport } from "./image-cleanup";

async function main() {
  assertDryRunArgs(process.argv.slice(2));
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for the read-only Blob report."
    );
  }
  const report = await createCleanupReport(
    path.join(process.cwd(), "content/posts"),
    {
      list: (options) => list({ ...options, token }),
      head: (url) => head(url, { token }),
    }
  );
  console.log(JSON.stringify(report, null, 2));
  console.log(
    "Report only: no objects deleted. Candidates are based on the local checkout, not proof of current production references."
  );
}

main().catch((error: unknown) => {
  // Upstream errors are sanitized by the reporter; never print token/SDK payloads.
  console.error(
    error instanceof Error ? error.message : "Cleanup report failed."
  );
  process.exitCode = 1;
});
