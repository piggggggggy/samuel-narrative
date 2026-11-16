/**
 * 독자용 콘텐츠 제공자
 *
 * 배포에 포함된 content/posts의 Markdown만 읽는다.
 * 목록과 본문이 같은 커밋의 파일에서 나오므로 서로 어긋나지 않는다.
 * 외부 서비스(GitHub, Blob)를 호출하지 않는다.
 */
import path from "path";
import type { ContentProvider } from "./types";
import type { Category, Post, PostMeta, PostsIndex } from "@/lib/schemas";
import { buildLocalIndex, readLocalPost } from "./local-reader";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL;
}

export class SnapshotProvider implements ContentProvider {
  private cachedIndex: PostsIndex | null = null;

  constructor(private readonly postsDir: string = POSTS_DIRECTORY) {}

  /**
   * 빌드와 운영에서는 파일이 바뀌지 않으므로 한 번만 계산한다.
   * 개발에서는 파일 수정이 바로 보이도록 매번 계산한다.
   */
  private loadIndex(): PostsIndex {
    if (!isProduction()) {
      return buildLocalIndex(this.postsDir);
    }

    if (!this.cachedIndex) {
      const index = buildLocalIndex(this.postsDir);
      if (index.totalCount === 0) {
        throw new Error(
          `No posts found in ${this.postsDir}. Refusing to serve an empty blog.`
        );
      }
      this.cachedIndex = index;
    }

    return this.cachedIndex;
  }

  private pick(slugs: string[]): PostMeta[] {
    const { posts } = this.loadIndex();
    return slugs
      .map((slug) => posts.find((post) => post.slug === slug))
      .filter((post): post is PostMeta => post !== undefined);
  }

  async getAllPostMetas(): Promise<PostMeta[]> {
    return this.loadIndex().posts;
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return readLocalPost(this.postsDir, slug);
  }

  async getPostsByTag(tag: string): Promise<PostMeta[]> {
    return this.pick(this.loadIndex().byTag[tag.toLowerCase()] || []);
  }

  async getAllTags(): Promise<string[]> {
    return Object.keys(this.loadIndex().byTag).sort();
  }

  async getPostsByCategory(category: Category): Promise<PostMeta[]> {
    return this.pick(this.loadIndex().byCategory[category] || []);
  }

  async getAllCategories(): Promise<Category[]> {
    const { byCategory } = this.loadIndex();
    return (Object.keys(byCategory) as Category[]).filter(
      (category) => byCategory[category].length > 0
    );
  }
}
