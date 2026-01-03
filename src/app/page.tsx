import { getContentProvider } from "@/lib/content";
import { PostList } from "@/components/post";

export const revalidate = 3600; // 1시간마다 재생성

export default async function HomePage() {
  const provider = await getContentProvider();
  const posts = await provider.getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          최신 포스트
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          웹 개발, 아키텍처, 그리고 개발 경험을 공유합니다.
        </p>
      </section>

      <PostList posts={posts} />
    </div>
  );
}
