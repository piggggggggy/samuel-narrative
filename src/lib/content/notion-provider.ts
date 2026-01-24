import type { ContentProvider, Post, PostMeta, Category } from "./types";

export class NotionProvider implements ContentProvider {
  async getAllPostMetas(): Promise<PostMeta[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }

  async getAllPosts(): Promise<Post[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    // TODO: Implement in Phase 1.4
    console.log("getPostBySlug:", slug);
    return null;
  }

  async getPostsByTag(tag: string): Promise<PostMeta[]> {
    // TODO: Implement in Phase 1.4
    console.log("getPostsByTag:", tag);
    return [];
  }

  async getAllTags(): Promise<string[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }

  async getPostsByCategory(category: Category): Promise<PostMeta[]> {
    // TODO: Implement in Phase 1.4
    console.log("getPostsByCategory:", category);
    return [];
  }

  async getAllCategories(): Promise<Category[]> {
    // TODO: Implement in Phase 1.4
    return [];
  }
}
