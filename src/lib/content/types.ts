export interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  thumbnail?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  thumbnail?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface ContentProvider {
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<Post[]>;
  getAllTags(): Promise<string[]>;

  // Phase 2: Content management (optional)
  createPost?(post: CreatePostInput): Promise<Post>;
  updatePost?(slug: string, post: UpdatePostInput): Promise<Post>;
  deletePost?(slug: string): Promise<void>;
}
