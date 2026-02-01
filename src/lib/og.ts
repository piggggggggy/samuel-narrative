import { siteConfig } from "@/lib/config/site";

const OG_IMAGES = [
  "/og/og-01.png",
  "/og/og-02.png",
  "/og/og-03.png",
  "/og/og-04.png",
  "/og/og-05.png",
  "/og/og-06.png",
  "/og/og-07.png",
  "/og/og-08.png",
  "/og/og-09.png",
] as const;

export const DEFAULT_OG_IMAGE = OG_IMAGES[0];

/**
 * slug 기반 결정적 해시로 OG 이미지 경로를 반환한다.
 * 같은 slug는 항상 같은 이미지를 반환한다.
 */
export function getOgImage(slug: string): string {
  const hash = slug
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const index = hash % OG_IMAGES.length;
  return OG_IMAGES[index];
}

/**
 * 절대 URL을 가진 OG 이미지 경로를 반환한다.
 */
export function getOgImageUrl(slug: string): string {
  return `${siteConfig.url}${getOgImage(slug)}`;
}

/**
 * 기본 OG 이미지의 절대 URL을 반환한다.
 */
export function getDefaultOgImageUrl(): string {
  return `${siteConfig.url}${DEFAULT_OG_IMAGE}`;
}
