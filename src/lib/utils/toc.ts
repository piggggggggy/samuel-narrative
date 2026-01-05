export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 텍스트를 URL-safe slug로 변환
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "") // 특수문자 제거 (한글 유지)
    .replace(/\s+/g, "-") // 공백 → 하이픈
    .replace(/-+/g, "-") // 연속 하이픈 제거
    .replace(/^-|-$/g, ""); // 앞뒤 하이픈 제거
}

/**
 * 마크다운 콘텐츠에서 헤딩(h2, h3, h4)을 추출하여 TOC 생성
 */
export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);

    // 빈 텍스트나 ID가 없는 경우 제외
    if (text && id) {
      toc.push({ id, text, level });
    }
  }

  return toc;
}

/**
 * 헤딩 텍스트를 ID로 변환 (PostContent와 동일한 로직 사용)
 */
export { slugify };
