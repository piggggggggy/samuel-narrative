import { getContentProvider } from "@/lib/content";
import { InfinitePostList } from "@/components/post";

export const revalidate = 3600; // 1시간마다 재생성

const POSTS_PER_PAGE = 10;

export default async function HomePage() {
  const provider = await getContentProvider();
  const allPosts = await provider.getAllPosts();

  // 초기 로드: 첫 페이지만 (SEO용 SSR)
  const initialPosts = allPosts.slice(0, POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-text-primary">
          최신 포스트
        </h1>
        <p className="mt-2 text-text-secondary">
          웹 개발, 아키텍처, 그리고 개발 경험을 공유합니다.
        </p>
      </section>

      <InfinitePostList initialPosts={initialPosts} postsPerPage={POSTS_PER_PAGE} />
    </div>
  );
}
