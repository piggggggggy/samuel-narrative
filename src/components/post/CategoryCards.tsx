import Link from "next/link";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
} from "@/lib/schemas";

interface CategoryCount {
  category: Category;
  count: number;
}

interface CategoryCardsProps {
  categoryCounts: CategoryCount[];
}

export function CategoryCards({ categoryCounts }: CategoryCardsProps) {
  const categories: Category[] = ["dev", "life", "review"];

  return (
    <section className="mt-12 border-t border-border-default pt-12">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">
        카테고리별로 더 많은 글 탐색하기
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((category) => {
          const countData = categoryCounts.find((c) => c.category === category);
          const count = countData?.count || 0;

          return (
            <Link
              key={category}
              href={`/category/${category}`}
              className="group rounded-xl border border-border-default bg-bg-secondary p-5 transition-all hover:border-accent-primary hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-primary">
                {CATEGORY_LABELS[category]}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
              <p className="mt-3 text-xs text-text-muted">
                {count}개의 포스트
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
