/**
 * posts-index.json 생성 스크립트
 *
 * 모든 포스트의 메타데이터를 읽어 인덱스 파일을 생성합니다.
 * - 빌드 시 또는 수동으로 실행
 * - pnpm run generate-index
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PostMeta, PostsIndex } from "../src/lib/content/types";
import { getReadingTimeMinutes } from "../src/lib/utils/reading-time";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");
const INDEX_OUTPUT_PATH = path.join(process.cwd(), "content/posts-index.json");

type Category = "dev" | "life" | "review";

interface PostFrontmatter {
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  category: Category;
}

function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    console.warn(`Posts directory not found: ${POSTS_DIRECTORY}`);
    return [];
  }
  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".md"));
}

function parsePostMeta(filename: string): PostMeta | null {
  const filePath = path.join(POSTS_DIRECTORY, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  try {
    const { data, content } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;
    const slug = filename.replace(/\.md$/, "");

    return {
      slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      publishedAt: frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt,
      tags: frontmatter.tags || [],
      category: frontmatter.category || "dev",
      readingTime: getReadingTimeMinutes(content),
    };
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
    return null;
  }
}

function buildTagIndex(posts: PostMeta[]): Record<string, string[]> {
  const byTag: Record<string, string[]> = {};

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      if (!byTag[normalizedTag]) {
        byTag[normalizedTag] = [];
      }
      byTag[normalizedTag].push(post.slug);
    });
  });

  // 각 태그의 slug 배열을 날짜순으로 정렬
  Object.keys(byTag).forEach((tag) => {
    byTag[tag].sort((a, b) => {
      const postA = posts.find((p) => p.slug === a);
      const postB = posts.find((p) => p.slug === b);
      if (!postA || !postB) return 0;
      return (
        new Date(postB.publishedAt).getTime() -
        new Date(postA.publishedAt).getTime()
      );
    });
  });

  return byTag;
}

function generateIndex(): PostsIndex {
  console.log("Generating posts index...");

  const files = getPostFiles();
  console.log(`Found ${files.length} post files`);

  const posts = files
    .map(parsePostMeta)
    .filter((post): post is PostMeta => post !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const byTag = buildTagIndex(posts);

  const index: PostsIndex = {
    posts,
    byTag,
    totalCount: posts.length,
    updatedAt: new Date().toISOString(),
  };

  return index;
}

function main() {
  const index = generateIndex();

  // Ensure content directory exists
  const contentDir = path.dirname(INDEX_OUTPUT_PATH);
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  fs.writeFileSync(INDEX_OUTPUT_PATH, JSON.stringify(index, null, 2));

  console.log(`\nIndex generated successfully!`);
  console.log(`  - Posts: ${index.totalCount}`);
  console.log(`  - Tags: ${Object.keys(index.byTag).length}`);
  console.log(`  - Output: ${INDEX_OUTPUT_PATH}`);
}

main();
