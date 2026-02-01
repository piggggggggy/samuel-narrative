import { getContentProvider } from "@/lib/content";
import { PostList, CategoryCards } from "@/components/post";
import type { Category } from "@/lib/schemas";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { getDefaultOgImageUrl } from "@/lib/og";

export const revalidate = 3600; // 1시간마다 재생성

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [getDefaultOgImageUrl()],
  },
};

const POSTS_PER_PAGE = 10;

export default async function HomePage() {
  const provider = await getContentProvider();
  const allPosts = await provider.getAllPostMetas();

  // 최신 10개만 표시
  const latestPosts = allPosts.slice(0, POSTS_PER_PAGE);

  // 카테고리별 포스트 개수 계산
  const categoryCounts: { category: Category; count: number }[] = [
    { category: "dev", count: allPosts.filter((p) => p.category === "dev").length },
    { category: "life", count: allPosts.filter((p) => p.category === "life").length },
    { category: "review", count: allPosts.filter((p) => p.category === "review").length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          최신 포스트
        </h1>
        <p className="mt-2 text-text-secondary">
          웹 개발, 아키텍처, 그리고 개발 경험을 공유합니다.
        </p>
      </section>

      <PostList posts={latestPosts} />

      <CategoryCards categoryCounts={categoryCounts} />
    </div>
  );
}
