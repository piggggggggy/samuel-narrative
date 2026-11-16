import assert from "node:assert/strict";
import { test } from "node:test";
import { siteConfig } from "@/lib/config/site";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as feed } from "@/app/feed.xml/route";

test("robots points at the sitemap on the configured site URL", () => {
  assert.equal(robots().sitemap, `${siteConfig.url}/sitemap.xml`);
});

test("every sitemap entry uses the configured site URL", async () => {
  const entries = await sitemap();

  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.ok(
      entry.url === siteConfig.url ||
        entry.url.startsWith(`${siteConfig.url}/`),
      entry.url
    );
  }
});

test("every feed link uses the configured site URL", async () => {
  const xml = await (await feed()).text();
  const urls = [...xml.matchAll(/https?:\/\/[^<"\s]+/g)]
    .map((match) => match[0])
    .filter((url) => !url.startsWith("http://www.w3.org/"));

  assert.ok(urls.length > 0);
  for (const url of urls) {
    assert.ok(
      url === siteConfig.url || url.startsWith(`${siteConfig.url}/`),
      url
    );
  }
});
