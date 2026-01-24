import { getContentProvider } from "@/lib/content";
import { PostList } from "@/components/post";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategorySchema, CATEGORY_LABELS, type Category } from "@/lib/schemas";

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const VALID_CATEGORIES: Category[] = ["dev", "life", "review"];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  // 유효한 카테고리인지 확인
  const parseResult = CategorySchema.safeParse(category);
  if (!parseResult.success) {
    return {
      title: "카테고리를 찾을 수 없습니다",
    };
  }

  const label = CATEGORY_LABELS[parseResult.data];
  return {
    title: `${label} 카테고리`,
    description: `${label} 카테고리의 포스트 목록입니다.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Zod로 유효성 검사
  const parseResult = CategorySchema.safeParse(category);
  if (!parseResult.success) {
    notFound();
  }

  const validCategory = parseResult.data;
  const provider = await getContentProvider();
  const posts = await provider.getPostsByCategory(validCategory);
  const label = CATEGORY_LABELS[validCategory];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12">
        <div className="mb-2">
          <span className="rounded-full bg-accent-primary/10 px-3 py-1 text-sm font-medium text-accent-primary">
            {label}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          {label} 포스트
        </h1>
        <p className="mt-2 text-text-secondary">
          {posts.length}개의 포스트가 있습니다.
        </p>
      </section>

      <PostList
        posts={posts}
        emptyMessage={`${label} 카테고리에 포스트가 없습니다.`}
      />
    </div>
  );
}
