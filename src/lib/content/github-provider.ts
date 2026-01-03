import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentProvider, Post } from "./types";

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
}
