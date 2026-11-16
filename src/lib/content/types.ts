/**
 * Content Layer Types
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

/**
 * 독자 화면용 읽기 계약
 * 배포에 포함된 콘텐츠만 읽는다.
 */
export interface ContentProvider {
  /** 모든 포스트 메타데이터 (content 제외, 최신순) */
  getAllPostMetas(): Promise<PostMeta[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<PostMeta[]>;
  getAllTags(): Promise<string[]>;
  getPostsByCategory(category: Category): Promise<PostMeta[]>;
  /** 포스트가 있는 카테고리만 반환 */
  getAllCategories(): Promise<Category[]>;
}

/**
 * 관리자 화면용 읽기와 쓰기 계약
 * 아직 배포되지 않은 최신 원본을 다룬다.
 */
export interface PostStore {
  listPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  createPost(post: CreatePostInput): Promise<Post>;
  updatePost(slug: string, post: UpdatePostInput): Promise<Post>;
  deletePost(slug: string): Promise<void>;
}
