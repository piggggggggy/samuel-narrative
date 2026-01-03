import type { ContentProvider, Post } from "./types";

export class GitHubProvider implements ContentProvider {
  async getAllPosts(): Promise<Post[]> {
    // TODO: Implement in Phase 1.3
    return [];
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    // TODO: Implement in Phase 1.3
    console.log("getPostBySlug:", slug);
    return null;
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    // TODO: Implement in Phase 1.3
    console.log("getPostsByTag:", tag);
    return [];
  }

  async getAllTags(): Promise<string[]> {
    // TODO: Implement in Phase 1.3
    return [];
  }
}
