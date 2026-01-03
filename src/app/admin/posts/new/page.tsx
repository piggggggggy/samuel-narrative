import { PostForm } from "@/components/admin";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        새 포스트 작성
      </h1>
      <PostForm mode="create" />
    </div>
  );
}
