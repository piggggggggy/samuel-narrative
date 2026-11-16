import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/common";
import { TaglineReveal } from "@/components/home/TaglineReveal";
import { CategoryCards, PostCard, PostList } from "@/components/post";
import { siteConfig } from "@/lib/config/site";
import { getContentProvider } from "@/lib/content";
import { getDefaultOgImageUrl } from "@/lib/og";
import { CategorySchema } from "@/lib/schemas";

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

const LATEST_COUNT = 9;

export default async function HomePage() {
  const provider = await getContentProvider();
  const allPosts = await provider.getAllPostMetas();

  const [featuredPost, ...restPosts] = allPosts;
  const latestPosts = restPosts.slice(0, LATEST_COUNT);

  const categoryCounts = CategorySchema.options.map((category) => ({
    category,
    count: allPosts.filter((post) => post.category === category).length,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-24 px-4 pb-24 pt-20 md:pt-24">
      {/* 히어로: 누구의 어떤 블로그인지, 그리고 할 일 하나 */}
      <section aria-labelledby="hero-heading" className="flex flex-col gap-10">
        <div className="flex flex-col items-start gap-6">
          <h1
            id="hero-heading"
            className="max-w-2xl heading-3 hero-heading md:heading-1"
          >
            <span className="block">기술이 제품의 가치가 되는</span>
            <span className="block">과정을 기록합니다</span>
          </h1>
          <p className="max-w-2xl title-2 text-pretty text-text-secondary">
            프론트엔드 개발자 박용태의 블로그입니다. 웹 개발과 아키텍처, 그리고
            읽은 책에서 배운 것을 씁니다.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#latest" className="button-primary button-md">
              최신 글 읽기
            </Link>
            <p className="caption-1 text-text-muted">
              지금까지 쓴 글 {allPosts.length}편
            </p>
          </div>
        </div>

        {featuredPost && (
          <div className="flex flex-col gap-3">
            <p className="caption-1 text-text-muted">가장 최근 글</p>
            <PostCard post={featuredPost} featured />
          </div>
        )}
      </section>

      <Reveal>
        <section
          id="latest"
          aria-labelledby="latest-heading"
          className="scroll-mt-24"
        >
          <h2 id="latest-heading" className="heading-5 text-text-primary">
            최신 글
          </h2>
          <div className="mt-6">
            <PostList posts={latestPosts} />
          </div>
        </section>
      </Reveal>

      <section aria-label="블로그가 지향하는 것" className="py-12">
        <TaglineReveal
          lines={[
            "좋은 제품은 좋은 팀에서 나온다고 믿습니다",
            "그래서 코드만큼 함께 일하는 방식을 고민합니다",
          ]}
        />
      </section>

      <Reveal>
        <CategoryCards categoryCounts={categoryCounts} />
      </Reveal>
    </div>
  );
}
