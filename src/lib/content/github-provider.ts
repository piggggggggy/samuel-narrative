import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentProvider, Post, CreatePostInput, UpdatePostInput } from "./types";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");
const POSTS_PATH = "content/posts";

interface PostFrontmatter {
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  thumbnail?: string;
}

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
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
  private getPostFiles(): string[] {
    if (!fs.existsSync(POSTS_DIRECTORY)) {
      return [];
    }
    return fs
      .readdirSync(POSTS_DIRECTORY)
      .filter((file) => file.endsWith(".md"));
  }

  private parsePost(slug: string): Post | null {
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return this.parseMarkdownContent(slug, fileContent);
  }

  private parseMarkdownContent(slug: string, fileContent: string): Post {
    const { data, content } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;

    return {
      slug,
      title: frontmatter.title,
      content,
      excerpt: frontmatter.excerpt,
      publishedAt: frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt,
      tags: frontmatter.tags || [],
      thumbnail: frontmatter.thumbnail,
    };
  }

  async getAllPosts(): Promise<Post[]> {
    const files = this.getPostFiles();
    const posts = files
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        return this.parsePost(slug);
      })
      .filter((post): post is Post => post !== null)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    return posts;
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return this.parsePost(slug);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter((post) =>
      post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );
  }

  async getAllTags(): Promise<string[]> {
    const allPosts = await this.getAllPosts();
    const tagSet = new Set<string>();

    allPosts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
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

    if (input.thumbnail || existingPost?.thumbnail) {
      frontmatter.thumbnail = input.thumbnail || existingPost?.thumbnail;
    }

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

    if (isProduction()) {
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
      return {
        slug: input.slug,
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        publishedAt: input.publishedAt || new Date().toISOString().split("T")[0],
        tags: input.tags || [],
        thumbnail: input.thumbnail,
      };
    } else {
      // Local development: use file system
      if (!fs.existsSync(POSTS_DIRECTORY)) {
        fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
      }

      const localFilePath = path.join(POSTS_DIRECTORY, `${input.slug}.md`);

      if (fs.existsSync(localFilePath)) {
        throw new Error(`Post with slug "${input.slug}" already exists`);
      }

      fs.writeFileSync(localFilePath, markdown, "utf-8");

      const post = this.parsePost(input.slug);
      if (!post) {
        throw new Error("Failed to create post");
      }

      return post;
    }
  }

  async updatePost(slug: string, input: UpdatePostInput): Promise<Post> {
    const filePath = `${POSTS_PATH}/${slug}.md`;

    if (isProduction()) {
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
      return {
        ...existingPost,
        ...input,
        slug,
      };
    } else {
      // Local development: use file system
      const existingPost = await this.getPostBySlug(slug);
      if (!existingPost) {
        throw new Error(`Post with slug "${slug}" not found`);
      }

      const localFilePath = path.join(POSTS_DIRECTORY, `${slug}.md`);
      const markdown = this.generateMarkdown(input, existingPost);
      fs.writeFileSync(localFilePath, markdown, "utf-8");

      const updatedPost = this.parsePost(slug);
      if (!updatedPost) {
        throw new Error("Failed to update post");
      }

      return updatedPost;
    }
  }

  async deletePost(slug: string): Promise<void> {
    const filePath = `${POSTS_PATH}/${slug}.md`;

    if (isProduction()) {
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
    } else {
      // Local development: use file system
      const localFilePath = path.join(POSTS_DIRECTORY, `${slug}.md`);

      if (!fs.existsSync(localFilePath)) {
        throw new Error(`Post with slug "${slug}" not found`);
      }

      fs.unlinkSync(localFilePath);
    }
  }
}
