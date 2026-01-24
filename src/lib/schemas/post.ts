/**
 * App Layer - Post Schema
 *
 * 앱에서 사용하는 포스트 데이터 구조 정의
 * Provider와 독립적인 비즈니스 레벨 스키마
 */

import { z } from "zod";

/**
 * 카테고리 스키마
 * - dev: 개발, 기술, 프로그래밍
 * - life: 일상, 일기, 회고, 생각
 * - review: 책, 영화, 제품 리뷰
 */
export const CategorySchema = z.enum(["dev", "life", "review"]);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  dev: "Dev",
  life: "Life",
  review: "Review",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  dev: "개발과 기술",
  life: "일상과 생각",
  review: "리뷰와 감상",
};

/**
 * 포스트 스키마 (전체 데이터)
 */
export const PostSchema = z.object({
  slug: z
    .string()
    .min(1, "slug는 필수입니다")
    .regex(/^[a-z0-9-]+$/, "slug는 소문자, 숫자, 하이픈만 허용됩니다"),
  title: z.string().min(1, "제목은 필수입니다"),
  content: z.string(),
  excerpt: z.string().min(1, "요약은 필수입니다"),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식: YYYY-MM-DD"),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식: YYYY-MM-DD")
    .optional(),
  tags: z.array(z.string()).default([]),
  category: CategorySchema,
});

export type Post = z.infer<typeof PostSchema>;

/**
 * 포스트 메타데이터 스키마 (content 제외)
 * 목록 조회 시 사용
 */
export const PostMetaSchema = PostSchema.omit({ content: true }).extend({
  readingTime: z.number().optional(),
});

export type PostMeta = z.infer<typeof PostMetaSchema>;

/**
 * 포스트 생성 입력 스키마
 */
export const CreatePostInputSchema = z.object({
  slug: z
    .string()
    .min(1, "slug는 필수입니다")
    .regex(/^[a-z0-9-]+$/, "slug는 소문자, 숫자, 하이픈만 허용됩니다"),
  title: z.string().min(1, "제목은 필수입니다"),
  content: z.string().min(1, "내용은 필수입니다"),
  excerpt: z.string().min(1, "요약은 필수입니다"),
  tags: z.array(z.string()).default([]),
  category: CategorySchema,
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

/**
 * 포스트 수정 입력 스키마
 */
export const UpdatePostInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  category: CategorySchema.optional(),
});

export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;

/**
 * 포스트 인덱스 스키마
 */
export const PostsIndexSchema = z.object({
  posts: z.array(PostMetaSchema),
  byTag: z.record(z.string(), z.array(z.string())),
  byCategory: z.record(CategorySchema, z.array(z.string())),
  totalCount: z.number(),
  updatedAt: z.string(),
});

export type PostsIndex = z.infer<typeof PostsIndexSchema>;
