import { getContentProvider } from "@/lib/content";
import { getReadingTimeMinutes, getRelatedPosts, extractToc } from "@/lib/utils";
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

export const revalidate = 3600;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samuel-narrative.vercel.app";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const provider = await getContentProvider();
  const posts = await provider.getAllPosts();
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

  // Use thumbnail if available, otherwise generate OG image
  const ogImage = post.thumbnail
    ? post.thumbnail
    : `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt)}`;

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

  const allPosts = await provider.getAllPosts();
  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  // 날짜순 정렬 (최신순)
  const sortedPosts = [...allPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
  const prevPost = sortedPosts[currentIndex + 1] || null; // 이전 글 (더 오래된)
  const nextPost = sortedPosts[currentIndex - 1] || null; // 다음 글 (더 최신)

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = getReadingTimeMinutes(post.content);
  const postUrl = `${BASE_URL}/posts/${slug}`;
  const tocItems = extractToc(post.content);
  const showToc = tocItems.length >= 3;

  return (
    <div className={`mx-auto px-4 py-12 ${showToc ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className={showToc ? "lg:grid lg:grid-cols-[1fr_220px] lg:gap-8" : ""}>
        {/* 메인 콘텐츠 */}
        <div className={showToc ? "max-w-3xl" : ""}>
          <article>
            <header className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-800">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                <time dateTime={post.publishedAt}>{formattedDate}</time>
                <span>·</span>
                <span>{readingTime}분 읽기</span>
                {post.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${tag}`}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
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

            <div className="mt-8 flex items-center justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </article>

          <PostNavigation prevPost={prevPost} nextPost={nextPost} />

          <RelatedPosts posts={relatedPosts} />

          <Utterances repo="piggggggggy/samuel-narrative" />

          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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

        {/* 목차 사이드바 */}
        {showToc && (
          <aside className="hidden lg:block self-start sticky top-24">
            <TableOfContents items={tocItems} />
          </aside>
        )}
      </div>
    </div>
  );
}
