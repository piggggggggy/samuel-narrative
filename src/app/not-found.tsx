import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-4 py-24">
      <p className="caption-1 text-text-muted">404</p>
      <h1 className="max-w-2xl heading-4 text-text-primary md:heading-3">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="max-w-2xl body-3 text-text-secondary">
        주소가 바뀌었거나 글이 삭제되었을 수 있습니다. 홈에서 최신 글을 확인해
        보세요.
      </p>
      <Link href="/" className="button-primary button-md">
        홈으로 가기
      </Link>
    </div>
  );
}
