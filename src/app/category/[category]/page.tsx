import { getContentProvider } from "@/lib/content";
import { InfinitePostList } from "@/components/post";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CategorySchema,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
} from "@/lib/schemas";

export const revalidate = 3600;

const POSTS_PER_PAGE = 10;

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

  const parseResult = CategorySchema.safeParse(category);
  if (!parseResult.success) {
    return {
      title: "카테고리를 찾을 수 없습니다",
    };
  }

  const label = CATEGORY_LABELS[parseResult.data];
  const description = CATEGORY_DESCRIPTIONS[parseResult.data];
  return {
    title: `${label} - ${description}`,
    description: `${label} 카테고리의 포스트 목록입니다. ${description}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const parseResult = CategorySchema.safeParse(category);
  if (!parseResult.success) {
    notFound();
  }

  const validCategory = parseResult.data;
  const provider = await getContentProvider();
  const posts = await provider.getPostsByCategory(validCategory);
  const label = CATEGORY_LABELS[validCategory];
  const description = CATEGORY_DESCRIPTIONS[validCategory];

  // 해당 카테고리 포스트의 태그만 추출
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  // 태그별 개수 계산 (해당 카테고리 내에서)
  const tagCounts = Array.from(tagSet).map((tag) => ({
    name: tag,
    count: posts.filter((post) => post.tags.includes(tag)).length,
  }));

  // 초기 로드용 포스트
  const initialPosts = posts.slice(0, POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{label}</h1>
        <p className="mt-2 text-text-secondary">{description}</p>
      </section>

      <InfinitePostList
        initialPosts={initialPosts}
        allTags={tagCounts}
        category={validCategory}
        postsPerPage={POSTS_PER_PAGE}
        emptyMessage={`${label} 카테고리에 포스트가 없습니다.`}
      />
    </div>
  );
}
