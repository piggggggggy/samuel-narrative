import { getContentProvider } from "@/lib/content";
import {
  getReadingTimeMinutes,
  getRelatedPosts,
  extractToc,
} from "@/lib/utils";
import {
  PostContent,
  RelatedPosts,
  PostNavigation,
  TableOfContents,
} from "@/components/post";
import { Utterances, ShareButtons } from "@/components/common";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { getOgImageUrl } from "@/lib/og";

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const provider = await getContentProvider();
  const posts = await provider.getAllPostMetas();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getContentProvider();
  const post = await provider.getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const ogImage = getOgImageUrl(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const provider = await getContentProvider();
  const post = await provider.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPostMetas = await provider.getAllPostMetas();
  const relatedPostMetas = getRelatedPosts(post, allPostMetas, 3);

  // 날짜순 정렬 (최신순)
  const sortedPostMetas = [...allPostMetas].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const currentIndex = sortedPostMetas.findIndex(
    (postMeta) => postMeta.slug === slug
  );
  const prevPostMeta = sortedPostMetas[currentIndex + 1] || null; // 이전 글 (더 오래된)
  const nextPostMeta = sortedPostMetas[currentIndex - 1] || null; // 다음 글 (더 최신)

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = getReadingTimeMinutes(post.content);
  const postUrl = `${siteConfig.url}/posts/${slug}`;
  const tocItems = extractToc(post.content);
  const showToc = tocItems.length >= 3;

  return (
    <div className="relative">
      {/* TOC 사이드바 - 뷰포트 기준 고정 위치 */}
      {showToc && (
        <aside className="hidden xl:block fixed top-24 right-[max(1rem,calc((100vw-896px)/2-220px-2rem))] w-[200px]">
          <TableOfContents items={tocItems} />
        </aside>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* 메인 콘텐츠 */}
        <div>
          <article>
            <header className="mb-8 border-b border-border-default pb-8">
              <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg text-text-secondary">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <time dateTime={post.publishedAt}>{formattedDate}</time>
                <span className="text-border-default">·</span>
                <span>{readingTime}분 읽기</span>
                {post.tags.length > 0 && (
                  <>
                    <span className="text-border-default">·</span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${tag}`}
                          className="rounded-full bg-tag-bg px-2.5 py-0.5 text-tag-text transition-colors hover:bg-tag-bg-hover"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </header>

            <PostContent content={post.content} />

            <div className="mt-8 flex items-center justify-end border-t border-border-default pt-6">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </article>

          <PostNavigation
            prevPostMeta={prevPostMeta}
            nextPostMeta={nextPostMeta}
          />

          <RelatedPosts postMetas={relatedPostMetas} />

          <Utterances repo="piggggggggy/samuel-narrative" />

          <div className="mt-12 border-t border-border-default pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
