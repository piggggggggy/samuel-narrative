import { getContentProvider } from "@/lib/content";
import { PostList } from "@/components/post";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const provider = await getContentProvider();
  const tags = await provider.getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `${decodedTag} 태그`,
    description: `${decodedTag} 태그가 달린 포스트 목록`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const provider = await getContentProvider();

  const allTags = await provider.getAllTags();
  if (!allTags.includes(decodedTag)) {
    notFound();
  }

  const posts = await provider.getPostsByTag(decodedTag);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12">
        <div className="mb-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {decodedTag}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {decodedTag} 태그 포스트
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {posts.length}개의 포스트가 있습니다.
        </p>
      </section>

      <PostList
        posts={posts}
        emptyMessage={`${decodedTag} 태그가 달린 포스트가 없습니다.`}
      />
    </div>
  );
}
