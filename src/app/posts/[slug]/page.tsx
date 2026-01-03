import { getContentProvider } from "@/lib/content";
import { PostContent } from "@/components/post";
import { Utterances } from "@/components/common";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

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

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.thumbnail && { images: [post.thumbnail] }),
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

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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
            {post.tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${tag}`}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
      </article>

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
  );
}
