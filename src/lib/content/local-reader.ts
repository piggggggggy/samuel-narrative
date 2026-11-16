/**
 * 로컬 checkout의 Markdown 읽기
 *
 * GitHub 설정이 없는 개발 환경에서 content/posts를 직접 읽는다.
 * 인덱스는 매번 파일에서 계산하며 content/posts-index.json은 읽거나 쓰지 않는다.
 */
import fs from "fs";
import path from "path";
import type { Category, Post, PostMeta, PostsIndex } from "@/lib/schemas";
import { getReadingTimeMinutes } from "@/lib/utils/reading-time";
import { parseMarkdownPost } from "./markdown";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type Env = Record<string, string | undefined>;

/**
 * 로컬 파일을 읽을지 결정
 * 운영 환경이 아니고 GitHub 설정이 빠져 있을 때만 true
 */
export function shouldReadLocally(env: Env = process.env): boolean {
  const isProduction = env.NODE_ENV === "production" || !!env.VERCEL;
  const hasGitHubConfig =
    !!env.GITHUB_TOKEN && !!env.GITHUB_OWNER && !!env.GITHUB_REPO;

  return !isProduction && !hasGitHubConfig;
}

function parseFile(postsDir: string, file: string): Post {
  try {
    return parseMarkdownPost(
      file,
      fs.readFileSync(path.join(postsDir, file), "utf-8")
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse ${file}: ${reason}`);
  }
}

function byNewest(a: { publishedAt: string }, b: { publishedAt: string }) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/**
 * 디렉터리의 모든 포스트 (최신순)
 */
export function listLocalPosts(postsDir: string): Post[] {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parseFile(postsDir, file))
    .sort(byNewest);
}

/**
 * slug로 포스트 1개 조회
 * slug 형식이 맞지 않으면 파일 경로를 만들지 않고 null 반환
 */
export function readLocalPost(postsDir: string, slug: string): Post | null {
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }

  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parseFile(postsDir, `${slug}.md`);
}

/**
 * 디렉터리의 포스트로 인덱스 계산
 */
export function buildLocalIndex(postsDir: string): PostsIndex {
  const posts: PostMeta[] = listLocalPosts(postsDir).map(
    ({ content, ...meta }) => ({
      ...meta,
      readingTime: getReadingTimeMinutes(content),
    })
  );

  const byTag: Record<string, string[]> = {};
  const byCategory: Record<Category, string[]> = {
    dev: [],
    life: [],
    review: [],
  };

  posts.forEach((post) => {
    byCategory[post.category].push(post.slug);
    new Set(post.tags.map((tag) => tag.toLowerCase())).forEach((tag) => {
      (byTag[tag] ??= []).push(post.slug);
    });
  });

  return {
    posts,
    byTag,
    byCategory,
    totalCount: posts.length,
    updatedAt: new Date().toISOString(),
  };
}
