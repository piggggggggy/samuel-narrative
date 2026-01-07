import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/providers";
import { ProgressBar } from "@/components/common";

// 코드용 모노스페이스 폰트만 Next.js 최적화로 로드
// 본문 폰트 Pretendard는 CSS CDN에서 Dynamic Subset으로 로드
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samuel-narrative.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Samuel Narrative",
    template: "%s | Samuel Narrative",
  },
  description:
    "개인 기술 블로그 - 웹 개발, 아키텍처, 그리고 개발 경험을 공유합니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Samuel Narrative",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        {/* Pretendard - Dynamic Subset (페이지에 사용된 글자만 로드) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-bg-primary font-sans text-text-primary antialiased">
        <SessionProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <ProgressBar />
            </Suspense>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
