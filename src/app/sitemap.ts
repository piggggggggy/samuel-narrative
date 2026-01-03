import { MetadataRoute } from "next";
import { getContentProvider } from "@/lib/content";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samuel-narrative.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provider = await getContentProvider();
  const posts = await provider.getAllPosts();
  const tags = await provider.getAllTags();

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/tags/${tag}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postUrls,
    ...tagUrls,
  ];
}
