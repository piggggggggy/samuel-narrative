/**
 * Site Configuration - Single Source of Truth (SSOT)
 * 사이트 전반에서 사용되는 설정을 중앙에서 관리합니다.
 */

export const siteConfig = {
  name: "Samuel Narrative",
  description:
    "개인 기술 블로그 - 웹 개발, 아키텍처, 그리고 개발 경험을 공유합니다.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL || "https://samuel-narrative.vercel.app",
  author: {
    name: "Samuel",
    role: "Web Developer",
  },
  social: {
    github: "https://github.com/piggggggggy",
    linkedin:
      "https://www.linkedin.com/in/%EC%9A%A9%ED%83%9C-%EB%B0%95-517a4421b/",
    email: "pyt4105@gmail.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
