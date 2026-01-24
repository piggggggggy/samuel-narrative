import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentProvider } from "./types";
import type { Post, PostMeta, PostsIndex, CreatePostInput, UpdatePostInput } from "@/lib/schemas";
import {
  parseFrontmatter,
  toPost,
  formatValidationError,
} from "./schemas";
import { getReadingTimeMinutes } from "@/lib/utils/reading-time";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");
const POSTS_PATH = "content/posts";
const INDEX_PATH = path.join(process.cwd(), "content/posts-index.json");

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

interface GitHubDirectoryItem {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL;
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    throw new Error(
      "GitHub API configuration missing. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables."
    );
  }

  return { token, owner, repo, branch };
}

async function githubApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, owner, repo } = getGitHubConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export class GitHubProvider implements ContentProvider {
  private indexCache: PostsIndex | null = null;

  /**
   * 인덱스 파일 로드 (캐싱)
   */
  private loadIndex(): PostsIndex {
    if (this.indexCache) {
      return this.indexCache;
    }

    if (!fs.existsSync(INDEX_PATH)) {
      console.warn("posts-index.json not found. Run: pnpm generate-index");
      // 빈 인덱스 반환
      return {
        posts: [],
        byTag: {},
        totalCount: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    const indexContent = fs.readFileSync(INDEX_PATH, "utf-8");
    this.indexCache = JSON.parse(indexContent) as PostsIndex;
    return this.indexCache;
  }

  /**
   * 인덱스 캐시 무효화 (CRUD 작업 후 호출)
   */
  private invalidateIndexCache(): void {
    this.indexCache = null;
  }

  /**
   * 인덱스에 새 포스트 추가
   */
  private addPostToIndex(post: Post): void {
    const index = this.loadIndex();

    const meta: PostMeta = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      tags: post.tags,
      readingTime: getReadingTimeMinutes(post.content),
    };

    // 기존 포스트가 있으면 제거
    index.posts = index.posts.filter((p) => p.slug !== post.slug);

    // 새 포스트 추가 후 정렬
    index.posts.push(meta);
    index.posts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // 태그 인덱스 재구성
    index.byTag = this.buildTagIndex(index.posts);
    index.totalCount = index.posts.length;
    index.updatedAt = new Date().toISOString();

    this.saveIndex(index);
  }

  /**
   * 인덱스에서 포스트 삭제
   */
  private removePostFromIndex(slug: string): void {
    const index = this.loadIndex();

    index.posts = index.posts.filter((p) => p.slug !== slug);
    index.byTag = this.buildTagIndex(index.posts);
    index.totalCount = index.posts.length;
    index.updatedAt = new Date().toISOString();

    this.saveIndex(index);
  }

  /**
   * 태그 인덱스 구성
   */
  private buildTagIndex(posts: PostMeta[]): Record<string, string[]> {
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

    return byTag;
  }

  /**
   * 인덱스 파일 저장
   */
  private saveIndex(index: PostsIndex): void {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    this.indexCache = index;
  }

  private getPostFiles(): string[] {
    if (!fs.existsSync(POSTS_DIRECTORY)) {
      return [];
    }
    return fs
      .readdirSync(POSTS_DIRECTORY)
      .filter((file) => file.endsWith(".md"));
  }

  private parsePost(slug: string, content: string): Post | null {
    if (!slug || !content) {
      console.error(`Invalid slug or content: ${slug}, ${content}`);
      return null;
    }

    const decodedContent = Buffer.from(content, "base64").toString("utf-8");

    return this.parseMarkdownContent(slug, decodedContent);
  }

  private parseMarkdownContent(slug: string, fileContent: string): Post {
    const { data, content } = matter(fileContent);
    const cleanSlug = slug.replace(/\.md$/, "");

    // Frontmatter 스키마 검증
    const result = parseFrontmatter(data);

    if (!result.success) {
      const errorMsg = formatValidationError(result.error!);
      console.error(`[${cleanSlug}] Frontmatter validation failed: ${errorMsg}`);
      // 검증 실패 시에도 기본값으로 파싱 시도 (빌드 중단 방지)
      return {
        slug: cleanSlug,
        title: (data as Record<string, unknown>).title as string || "Untitled",
        content,
        excerpt: (data as Record<string, unknown>).excerpt as string || "",
        publishedAt: (data as Record<string, unknown>).publishedAt as string || new Date().toISOString().split("T")[0],
        tags: Array.isArray((data as Record<string, unknown>).tags) ? (data as Record<string, unknown>).tags as string[] : [],
      };
    }

    return toPost(cleanSlug, result.data!, content);
  }

  /**
   * 인덱스에서 모든 포스트 메타데이터 조회 (content 제외)
   * 빠름: 인덱스 파일 1회 읽기
   */
  async getAllPostMetas(): Promise<PostMeta[]> {
    const index = this.loadIndex();
    return index.posts;
  }

  /**
   * 모든 포스트 조회 (content 포함)
   * 느림: 모든 파일을 개별 fetch
   * @deprecated 가능하면 getAllPostMetas() 사용 권장
   */
  async getAllPosts(): Promise<Post[]> {
    const directoryItems = await githubApiRequest<GitHubDirectoryItem[]>(
      `/contents/${POSTS_PATH}`
    );

    const mdFiles = directoryItems.filter(
      (item) => item.type === "file" && item.name.endsWith(".md")
    );

    const posts = await Promise.all(
      mdFiles.map(async (item) => {
        const fileResponse = await githubApiRequest<GitHubFileResponse>(
          `/contents/${POSTS_PATH}/${item.name}`
        );

        return this.parsePost(item.name, fileResponse.content);
      })
    );

    return posts
      .filter((post): post is Post => post !== null)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const fileResponse = await githubApiRequest<GitHubFileResponse>(
        `/contents/${POSTS_PATH}/${slug}.md`
      );

      return this.parsePost(slug, fileResponse.content);
    } catch {
      return null;
    }
  }

  /**
   * 인덱스에서 태그별 포스트 조회 (content 제외)
   * 빠름: 인덱스의 byTag 맵 사용
   */
  async getPostsByTag(tag: string): Promise<PostMeta[]> {
    const index = this.loadIndex();
    const normalizedTag = tag.toLowerCase();
    const slugs = index.byTag[normalizedTag] || [];

    // 인덱스에서 해당 slug의 메타데이터 반환
    return slugs
      .map((slug) => index.posts.find((p) => p.slug === slug))
      .filter((post): post is PostMeta => post !== undefined);
  }

  /**
   * 인덱스에서 모든 태그 조회
   * 빠름: 인덱스의 byTag 키 사용
   */
  async getAllTags(): Promise<string[]> {
    const index = this.loadIndex();
    return Object.keys(index.byTag).sort();
  }

  private generateMarkdown(
    input: CreatePostInput | (UpdatePostInput & { slug?: string }),
    existingPost?: Post
  ): string {
    const now = new Date().toISOString().split("T")[0];

    const frontmatter: Record<string, unknown> = {
      title:
        "title" in input && input.title ? input.title : existingPost?.title,
      excerpt:
        "excerpt" in input && input.excerpt
          ? input.excerpt
          : existingPost?.excerpt,
      publishedAt:
        "publishedAt" in input && input.publishedAt
          ? input.publishedAt
          : existingPost?.publishedAt || now,
      tags:
        "tags" in input && input.tags ? input.tags : existingPost?.tags || [],
    };

    const content =
      "content" in input && input.content !== undefined
        ? input.content
        : existingPost?.content || "";

    const yamlContent = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map((v) => `"${v}"`).join(", ")}]`;
        }
        return `${key}: "${value}"`;
      })
      .join("\n");

    return `---\n${yamlContent}\n---\n\n${content}`;
  }

  private async getFileSha(filePath: string): Promise<string | null> {
    try {
      const response = await githubApiRequest<GitHubFileResponse>(
        `/contents/${filePath}`
      );
      return response.sha;
    } catch {
      return null;
    }
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const markdown = this.generateMarkdown(input);
    const filePath = `${POSTS_PATH}/${input.slug}.md`;

    const { branch } = getGitHubConfig();

    // Check if file already exists
    const existingSha = await this.getFileSha(filePath);
    if (existingSha) {
      throw new Error(`Post with slug "${input.slug}" already exists`);
    }

    // Create file via GitHub API
    await githubApiRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Create post: ${input.title}`,
        content: Buffer.from(markdown).toString("base64"),
        branch,
      }),
    });

    // Return the created post
    const post: Post = {
      slug: input.slug,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      publishedAt: input.publishedAt || new Date().toISOString().split("T")[0],
      tags: input.tags || [],
    };

    // Update local index
    this.addPostToIndex(post);

    return post;
  }

  async updatePost(slug: string, input: UpdatePostInput): Promise<Post> {
    const filePath = `${POSTS_PATH}/${slug}.md`;

    const { branch } = getGitHubConfig();

    // Get existing file to get SHA and content
    const existingFile = await githubApiRequest<GitHubFileResponse>(
      `/contents/${filePath}`
    ).catch(() => null);

    if (!existingFile) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    // Decode existing content
    const existingContent = Buffer.from(
      existingFile.content,
      "base64"
    ).toString("utf-8");
    const existingPost = this.parseMarkdownContent(slug, existingContent);

    // Generate updated markdown
    const markdown = this.generateMarkdown(input, existingPost);

    // Update file via GitHub API
    await githubApiRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Update post: ${slug}`,
        content: Buffer.from(markdown).toString("base64"),
        sha: existingFile.sha,
        branch,
      }),
    });

    // Return updated post
    const updatedPost: Post = {
      ...existingPost,
      ...input,
      slug,
    };

    // Update local index
    this.addPostToIndex(updatedPost);

    return updatedPost;
  }

  async deletePost(slug: string): Promise<void> {
    const filePath = `${POSTS_PATH}/${slug}.md`;

    const { branch } = getGitHubConfig();

    // Get file SHA
    const existingFile = await githubApiRequest<GitHubFileResponse>(
      `/contents/${filePath}`
    ).catch(() => null);

    if (!existingFile) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    // Delete file via GitHub API
    await githubApiRequest(`/contents/${filePath}`, {
      method: "DELETE",
      body: JSON.stringify({
        message: `Delete post: ${slug}`,
        sha: existingFile.sha,
        branch,
      }),
    });

    // Update local index
    this.removePostFromIndex(slug);
  }
}
