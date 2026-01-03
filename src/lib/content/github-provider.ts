import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentProvider, Post, CreatePostInput, UpdatePostInput } from "./types";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");

interface PostFrontmatter {
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  thumbnail?: string;
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

  private generateMarkdown(input: CreatePostInput | (UpdatePostInput & { slug?: string }), existingPost?: Post): string {
    const now = new Date().toISOString().split("T")[0];

    const frontmatter: Record<string, unknown> = {
      title: "title" in input && input.title ? input.title : existingPost?.title,
      excerpt: "excerpt" in input && input.excerpt ? input.excerpt : existingPost?.excerpt,
      publishedAt: "publishedAt" in input && input.publishedAt ? input.publishedAt : existingPost?.publishedAt || now,
      tags: "tags" in input && input.tags ? input.tags : existingPost?.tags || [],
    };

    if (input.thumbnail || existingPost?.thumbnail) {
      frontmatter.thumbnail = input.thumbnail || existingPost?.thumbnail;
    }

    const content = "content" in input && input.content !== undefined ? input.content : existingPost?.content || "";

    const yamlContent = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(", ")}]`;
        }
        return `${key}: "${value}"`;
      })
      .join("\n");

    return `---\n${yamlContent}\n---\n\n${content}`;
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    if (!fs.existsSync(POSTS_DIRECTORY)) {
      fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
    }

    const filePath = path.join(POSTS_DIRECTORY, `${input.slug}.md`);

    if (fs.existsSync(filePath)) {
      throw new Error(`Post with slug "${input.slug}" already exists`);
    }

    const markdown = this.generateMarkdown(input);
    fs.writeFileSync(filePath, markdown, "utf-8");

    const post = this.parsePost(input.slug);
    if (!post) {
      throw new Error("Failed to create post");
    }

    return post;
  }

  async updatePost(slug: string, input: UpdatePostInput): Promise<Post> {
    const existingPost = await this.getPostBySlug(slug);
    if (!existingPost) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);
    const markdown = this.generateMarkdown(input, existingPost);
    fs.writeFileSync(filePath, markdown, "utf-8");

    const updatedPost = this.parsePost(slug);
    if (!updatedPost) {
      throw new Error("Failed to update post");
    }

    return updatedPost;
  }

  async deletePost(slug: string): Promise<void> {
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    fs.unlinkSync(filePath);
  }
}
