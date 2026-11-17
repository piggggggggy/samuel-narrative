import type { Metadata } from "next";
import { PostRow } from "@/components/post";
import { siteConfig } from "@/lib/config/site";
import { getContentProvider } from "@/lib/content";
import { getDefaultOgImageUrl } from "@/lib/og";

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

const LATEST_COUNT = 10;

export default async function HomePage() {
  const provider = await getContentProvider();
  const allPosts = await provider.getAllPostMetas();
  const latestPosts = allPosts.slice(0, LATEST_COUNT);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 pb-24 pt-16 md:pt-20">
      <h1 className="sr-only">{siteConfig.name}</h1>

      <section aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="caption-1 text-text-muted">
          최신 글
        </h2>
        {latestPosts.length === 0 ? (
          <p className="mt-6 body-3 text-text-muted">
            아직 작성된 포스트가 없습니다.
          </p>
        ) : (
          <ul className="mt-2">
            {latestPosts.map((post, index) => (
              <li key={post.slug}>
                {index > 0 && (
                  <div aria-hidden="true" className="h-px bg-border-default" />
                )}
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
