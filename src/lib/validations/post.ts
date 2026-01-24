import { z } from "zod";
import { CategorySchema } from "@/lib/schemas";

export const createPostSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이내로 입력해주세요"),
  slug: z
    .string()
    .min(1, "Slug를 입력해주세요")
    .regex(/^[a-z0-9-]+$/, "Slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다"),
  content: z.string().min(1, "내용을 입력해주세요"),
  excerpt: z.string().max(500, "요약은 500자 이내로 입력해주세요"),
  tags: z.array(z.string()).default([]),
  category: CategorySchema,
  publishedAt: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  category: CategorySchema.optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
