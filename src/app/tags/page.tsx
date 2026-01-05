import { getContentProvider } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "모든 태그",
  description: "블로그의 모든 태그를 둘러보세요.",
};

export default async function TagsPage() {
  const provider = await getContentProvider();
  const allPosts = await provider.getAllPosts();
  const allTags = await provider.getAllTags();

  // 태그별 포스트 개수 계산 및 정렬
  const tagCounts = allTags
    .map((tag) => ({
      name: tag,
      count: allPosts.filter((post) => post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">모든 태그</h1>
        <p className="mt-2 text-text-secondary">
          {tagCounts.length}개의 태그, {allPosts.length}개의 포스트
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        {tagCounts.map((tag) => (
          <Link
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="group flex items-center gap-2 rounded-full bg-tag-bg px-4 py-2 transition-colors hover:bg-tag-bg-hover"
          >
            <span className="font-medium text-text-primary group-hover:text-accent-primary">
              {tag.name}
            </span>
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-muted">
              {tag.count}
            </span>
          </Link>
        ))}
      </div>

      {tagCounts.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-text-muted">아직 태그가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
