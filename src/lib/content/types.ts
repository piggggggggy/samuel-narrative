/**
 * Content Provider Types
 *
 * 데이터 타입은 @/lib/schemas에서 정의하고 여기서 re-export
 */
import type {
  Post,
  PostMeta,
  CreatePostInput,
  UpdatePostInput,
  Category,
} from "@/lib/schemas";

export type {
  Post,
  PostMeta,
  PostsIndex,
  CreatePostInput,
  UpdatePostInput,
  Category,
} from "@/lib/schemas";

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

  // Phase 7: Category support
  getPostsByCategory(category: Category): Promise<PostMeta[]>;
  getAllCategories(): Promise<Category[]>;

  // Phase 2: Content management (optional)
  createPost?(post: CreatePostInput): Promise<Post>;
  updatePost?(slug: string, post: UpdatePostInput): Promise<Post>;
  deletePost?(slug: string): Promise<void>;
}
