import type { ContentProvider, Post } from "./types";

export class NotionProvider implements ContentProvider {
  async getAllPosts(): Promise<Post[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    // TODO: Implement in Phase 1.4
    console.log("getPostBySlug:", slug);
    return null;
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    // TODO: Implement in Phase 1.4
    console.log("getPostsByTag:", tag);
    return [];
  }

  async getAllTags(): Promise<string[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }
}
