import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButtons, Utterances } from "@/components/common";
import {
  formatPostDate,
  PostContent,
  PostNavigation,
  RelatedPosts,
  TableOfContents,
} from "@/components/post";
import { siteConfig } from "@/lib/config/site";
import { getContentProvider } from "@/lib/content";
import { getOgImageUrl } from "@/lib/og";
import { CATEGORY_LABELS } from "@/lib/schemas";
import {
  extractToc,
  getReadingTimeMinutes,
  getRelatedPosts,
} from "@/lib/utils";

// 글은 배포 때만 바뀐다. 빌드에 없는 slug는 404로 처리한다.
export const dynamicParams = false;

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

  const readingTime = getReadingTimeMinutes(post.content);
  const postUrl = `${siteConfig.url}/posts/${slug}`;
  const tocItems = extractToc(post.content);
  const showToc = tocItems.length >= 3;

  return (
    <div className="relative">
      {/* 목차: 넓은 화면에서 본문 오른쪽에 고정 */}
      {showToc && (
        <aside className="fixed right-[max(1rem,calc((100vw-768px)/2-200px-2rem))] top-24 hidden w-[200px] xl:block">
          <TableOfContents items={tocItems} />
        </aside>
      )}

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-16">
        <article>
          <header className="flex flex-col gap-4 pb-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 caption-2 text-text-muted">
              <Link
                href={`/category/${post.category}`}
                className="transition-colors hover:text-text-primary"
              >
                {CATEGORY_LABELS[post.category]}
              </Link>
              <time dateTime={post.publishedAt}>
                {formatPostDate(post.publishedAt)}
              </time>
              <span>{readingTime}분 읽기</span>
            </div>
            <h1 className="heading-4 text-text-primary md:heading-3">
              {post.title}
            </h1>
            <p className="body-3 text-text-secondary">{post.excerpt}</p>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-x-3 gap-y-1 caption-2 text-text-muted">
                {post.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
            )}
          </header>

          <div className="h-px bg-border-default" />

          <div className="pt-8">
            <PostContent content={post.content} />
          </div>

          <div className="mt-12 h-px bg-border-default" />
          <div className="flex items-center justify-end pt-4">
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        <PostNavigation
          prevPostMeta={prevPostMeta}
          nextPostMeta={nextPostMeta}
        />

        <RelatedPosts postMetas={relatedPostMetas} />

        <Utterances repo="piggggggggy/samuel-narrative" />

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center body-5 text-text-muted transition-colors hover:text-text-primary"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
