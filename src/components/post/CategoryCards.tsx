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
  // 글이 있는 주제만 보여준다
  const categories = categoryCounts.filter(({ count }) => count > 0);

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="heading-5 text-text-primary">
        주제별로 읽기
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {categories.map(({ category, count }) => (
          <Link
            key={category}
            href={`/category/${category}`}
            className="group rounded-2xl p-6 glass-card"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="heading-6 text-text-primary">
                {CATEGORY_LABELS[category]}
              </h3>
              <span className="caption-4 text-text-muted">글 {count}편</span>
            </div>
            <p className="mt-2 body-6 text-text-secondary">
              {CATEGORY_DESCRIPTIONS[category]}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
