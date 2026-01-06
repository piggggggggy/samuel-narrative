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

/**
 * 포스트 메타데이터 (content 제외)
 * 목록 조회 시 사용 - 인덱스 기반 최적화
 */
export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  thumbnail?: string;
  readingTime?: number; // 분 단위 읽기 시간
}

/**
 * 포스트 인덱스 구조
 */
export interface PostsIndex {
  posts: PostMeta[];
  byTag: Record<string, string[]>; // tag -> slug[]
  totalCount: number;
  updatedAt: string;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  thumbnail?: string;
  publishedAt?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface ContentProvider {
  /**
   * 모든 포스트 메타데이터 조회 (content 제외)
   * 목록 페이지에서 사용 - 인덱스 기반으로 빠름
   */
  getAllPostMetas(): Promise<PostMeta[]>;

  /**
   * 모든 포스트 조회 (content 포함)
   * @deprecated 가능하면 getAllPostMetas() 사용 권장
   */
  getAllPosts(): Promise<Post[]>;

  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<PostMeta[]>;
  getAllTags(): Promise<string[]>;

  // Phase 2: Content management (optional)
  createPost?(post: CreatePostInput): Promise<Post>;
  updatePost?(slug: string, post: UpdatePostInput): Promise<Post>;
  deletePost?(slug: string): Promise<void>;
}
