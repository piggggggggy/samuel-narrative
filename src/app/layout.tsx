import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/providers";
import { ProgressBar } from "@/components/common";
import { siteConfig } from "@/lib/config/site";
import { getDefaultOgImageUrl } from "@/lib/og";

// 코드용 모노스페이스 폰트만 Next.js 최적화로 로드
// 본문 폰트 Pretendard는 CSS CDN에서 Dynamic Subset으로 로드
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [getDefaultOgImageUrl()],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
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
