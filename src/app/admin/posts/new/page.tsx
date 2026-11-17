import { PostForm } from "@/components/admin";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-8 heading-5 text-text-primary">새 포스트 작성</h1>
      <PostForm mode="create" />
    </div>
  );
}
