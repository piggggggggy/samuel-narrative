import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 목록 API는 실행 중에 글 파일을 읽으므로 함수 번들에 포함한다
  outputFileTracingIncludes: {
    "/api/posts": ["./content/posts/**/*.md"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
