/**
 * 관리자용 포스트 저장소
 *
 * GitHub 저장소의 Markdown이 원본이다. 편집 화면은 여기서 최신 원본을 읽고,
 * 저장은 GitHub 커밋 한 번으로 끝난다. 독자 화면은 이 모듈을 쓰지 않는다.
 */
import path from "path";
import type { PostStore } from "./types";
import type { Post, CreatePostInput, UpdatePostInput } from "@/lib/schemas";
import {
  isValidSlug,
  parseMarkdownPost,
  readFrontmatter,
  serializePost,
} from "./markdown";
import {
  listLocalPosts,
  readLocalPost,
  shouldReadLocally,
} from "./local-reader";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");
const POSTS_PATH = "content/posts";

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

function today(): string {
  return new Date().toISOString().split("T")[0];
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

function decode(file: GitHubFileResponse): string {
  return Buffer.from(file.content, "base64").toString("utf-8");
}

/**
 * 쓰기와 같은 브랜치에서 읽도록 ref를 붙인 경로
 */
function contentsPath(filePath: string): string {
  const { branch } = getGitHubConfig();
  return `/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
}

export class GitHubPostStore implements PostStore {
  /**
   * 모든 포스트 (content 포함, 최신순)
   * GitHub 설정이 없는 개발 환경에서는 checkout의 파일을 읽는다.
   */
  async listPosts(): Promise<Post[]> {
    if (shouldReadLocally()) {
      return listLocalPosts(POSTS_DIRECTORY);
    }

    const directoryItems = await githubApiRequest<GitHubDirectoryItem[]>(
      contentsPath(POSTS_PATH)
    );

    const mdFiles = directoryItems.filter(
      (item) => item.type === "file" && item.name.endsWith(".md")
    );

    const posts = await Promise.all(
      mdFiles.map(async (item) => {
        const file = await githubApiRequest<GitHubFileResponse>(
          contentsPath(`${POSTS_PATH}/${item.name}`)
        );
        return parseMarkdownPost(item.name, decode(file));
      })
    );

    return posts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getPost(slug: string): Promise<Post | null> {
    if (shouldReadLocally()) {
      return readLocalPost(POSTS_DIRECTORY, slug);
    }

    if (!isValidSlug(slug)) {
      return null;
    }

    const file = await this.fetchFile(slug);
    return file ? parseMarkdownPost(slug, decode(file)) : null;
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    if (!isValidSlug(input.slug)) {
      throw new Error(`Invalid slug "${input.slug}"`);
    }

    const { branch } = getGitHubConfig();
    const filePath = `${POSTS_PATH}/${input.slug}.md`;
    const post: Post = {
      slug: input.slug,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      publishedAt: input.publishedAt || today(),
      tags: input.tags || [],
      category: input.category,
    };

    if (await this.fetchFile(input.slug)) {
      throw new Error(`Post with slug "${input.slug}" already exists`);
    }

    await githubApiRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Create post: ${input.title}`,
        content: Buffer.from(
          serializePost(
            {
              title: post.title,
              excerpt: post.excerpt,
              publishedAt: post.publishedAt,
              tags: post.tags,
              category: post.category,
            },
            post.content
          )
        ).toString("base64"),
        branch,
      }),
    });

    return post;
  }

  async updatePost(slug: string, input: UpdatePostInput): Promise<Post> {
    if (!isValidSlug(slug)) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const { branch } = getGitHubConfig();
    const filePath = `${POSTS_PATH}/${slug}.md`;
    const existingFile = await this.fetchFile(slug);

    if (!existingFile) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const existingContent = decode(existingFile);
    const existingPost = parseMarkdownPost(slug, existingContent);

    // 수정한 값만 바꾸고 나머지 frontmatter는 그대로 둔다
    const updatedPost: Post = {
      ...existingPost,
      ...(input.title ? { title: input.title } : {}),
      ...(input.excerpt ? { excerpt: input.excerpt } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      slug,
      updatedAt: today(),
    };

    await githubApiRequest(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Update post: ${slug}`,
        content: Buffer.from(
          serializePost(
            {
              title: updatedPost.title,
              excerpt: updatedPost.excerpt,
              updatedAt: updatedPost.updatedAt,
              tags: updatedPost.tags,
              category: updatedPost.category,
            },
            updatedPost.content,
            readFrontmatter(existingContent)
          )
        ).toString("base64"),
        sha: existingFile.sha,
        branch,
      }),
    });

    return updatedPost;
  }

  async deletePost(slug: string): Promise<void> {
    if (!isValidSlug(slug)) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const { branch } = getGitHubConfig();
    const filePath = `${POSTS_PATH}/${slug}.md`;
    const existingFile = await this.fetchFile(slug);

    if (!existingFile) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    await githubApiRequest(`/contents/${filePath}`, {
      method: "DELETE",
      body: JSON.stringify({
        message: `Delete post: ${slug}`,
        sha: existingFile.sha,
        branch,
      }),
    });
  }

  private async fetchFile(slug: string): Promise<GitHubFileResponse | null> {
    return githubApiRequest<GitHubFileResponse>(
      contentsPath(`${POSTS_PATH}/${slug}.md`)
    ).catch(() => null);
  }
}
