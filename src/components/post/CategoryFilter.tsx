"use client";

import { CATEGORY_LABELS, type Category } from "@/lib/schemas";

interface CategoryCount {
  id: Category;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryCount[];
  selected: Category | null;
  onSelect: (category: Category | null) => void;
  totalCount?: number;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  totalCount,
}: CategoryFilterProps) {
  // 전체 카운트 계산
  const allCount = totalCount ?? categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* 전체 버튼 */}
      <button
        onClick={() => onSelect(null)}
        className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? "bg-accent-primary text-text-inverted shadow-md"
            : "glass-card text-text-secondary hover:text-text-primary"
        }`}
      >
        All
        <span className="ml-1.5 text-xs opacity-70">({allCount})</span>
      </button>

      {/* 카테고리 버튼들 */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            selected === category.id
              ? "bg-accent-primary text-text-inverted shadow-md"
              : "glass-card text-text-secondary hover:text-text-primary"
          }`}
        >
          {category.label}
          <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
        </button>
      ))}
    </div>
  );
}

// 헬퍼 함수: PostMeta 배열에서 카테고리 카운트 생성
export function buildCategoryCounts(
  posts: Array<{ category: Category }>
): CategoryCount[] {
  const counts: Record<Category, number> = {
    dev: 0,
    life: 0,
    review: 0,
  };

  posts.forEach((post) => {
    counts[post.category]++;
  });

  // 포스트가 있는 카테고리만 반환
  return (Object.entries(counts) as [Category, number][])
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({
      id,
      label: CATEGORY_LABELS[id],
      count,
    }));
}
