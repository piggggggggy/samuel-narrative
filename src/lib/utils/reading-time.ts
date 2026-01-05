/**
 * Reading Time Calculator (Medium-style)
 *
 * 읽기 시간 계산 모듈
 * - 영어: 265 단어/분 (Medium 기준)
 * - 한글: 500 글자/분 (한글 2글자 ≈ 영어 1단어)
 * - 이미지: 첫 이미지 12초, 이후 -1초씩 감소 (최소 3초)
 */

export interface ReadingTimeResult {
  /** 읽기 시간 (분) */
  minutes: number;
  /** 표시용 텍스트 (예: "3분") */
  text: string;
  /** 총 단어 수 (영어 기준 환산) */
  words: number;
  /** 이미지 수 */
  images: number;
}

export interface ReadingTimeOptions {
  /** 분당 단어 수 (기본: 265) */
  wordsPerMinute?: number;
  /** 한글 글자당 단어 환산 비율 (기본: 0.5, 즉 2글자 = 1단어) */
  koreanCharToWordRatio?: number;
  /** 첫 이미지 읽기 시간 - 초 (기본: 12) */
  firstImageTime?: number;
  /** 이미지당 감소 시간 - 초 (기본: 1) */
  imageTimeDecrement?: number;
  /** 최소 이미지 읽기 시간 - 초 (기본: 3) */
  minImageTime?: number;
}

const DEFAULT_OPTIONS: Required<ReadingTimeOptions> = {
  wordsPerMinute: 265,
  koreanCharToWordRatio: 0.5,
  firstImageTime: 12,
  imageTimeDecrement: 1,
  minImageTime: 3,
};

/**
 * 마크다운 콘텐츠에서 읽기 시간을 계산합니다.
 *
 * @param content - 마크다운 콘텐츠
 * @param options - 계산 옵션
 * @returns 읽기 시간 결과
 *
 * @example
 * ```ts
 * const result = calculateReadingTime(post.content);
 * console.log(result.text); // "3분"
 * ```
 */
export function calculateReadingTime(
  content: string,
  options: ReadingTimeOptions = {}
): ReadingTimeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 이미지 수 계산 (마크다운 이미지 문법)
  const images = countImages(content);

  // 코드 블록 제거 (코드는 별도 계산하거나 제외)
  const contentWithoutCode = removeCodeBlocks(content);

  // 마크다운 문법 제거
  const plainText = stripMarkdown(contentWithoutCode);

  // 단어 수 계산
  const words = countWords(plainText, opts.koreanCharToWordRatio);

  // 읽기 시간 계산
  const wordTime = words / opts.wordsPerMinute;
  const imageTime =
    calculateImageTime(images, opts.firstImageTime, opts.imageTimeDecrement, opts.minImageTime) /
    60;

  const totalMinutes = Math.max(1, Math.ceil(wordTime + imageTime));

  return {
    minutes: totalMinutes,
    text: `${totalMinutes}분`,
    words: Math.round(words),
    images,
  };
}

/**
 * 간단한 읽기 시간 계산 (분 단위만 반환)
 */
export function getReadingTimeMinutes(content: string): number {
  return calculateReadingTime(content).minutes;
}

/**
 * 이미지 수 계산
 */
function countImages(content: string): number {
  // 마크다운 이미지: ![alt](url)
  const markdownImages = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  // HTML 이미지: <img ... />
  const htmlImages = (content.match(/<img[^>]*>/gi) || []).length;
  return markdownImages + htmlImages;
}

/**
 * 코드 블록 제거
 */
function removeCodeBlocks(content: string): string {
  // 펜스드 코드 블록 (```)
  let result = content.replace(/```[\s\S]*?```/g, "");
  // 인라인 코드 (`code`)
  result = result.replace(/`[^`]+`/g, "");
  return result;
}

/**
 * 마크다운 문법 제거
 */
function stripMarkdown(content: string): string {
  return (
    content
      // 헤더
      .replace(/^#{1,6}\s+/gm, "")
      // 볼드/이탤릭
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      // 링크
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 이미지 (이미 계산했으므로 제거)
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // HTML 태그
      .replace(/<[^>]+>/g, "")
      // 인용문
      .replace(/^>\s+/gm, "")
      // 수평선
      .replace(/^[-*_]{3,}$/gm, "")
      // 리스트 마커
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // 여러 줄바꿈 정리
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

/**
 * 단어 수 계산 (영어 + 한글 혼합)
 */
function countWords(text: string, koreanCharToWordRatio: number): number {
  // 한글 글자 수
  const koreanChars = (text.match(/[가-힣]/g) || []).length;

  // 한글을 제외한 텍스트에서 영어 단어 수
  const textWithoutKorean = text.replace(/[가-힣]/g, " ");
  const englishWords = textWithoutKorean
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // 한글 글자를 단어로 환산하여 합산
  const koreanWords = koreanChars * koreanCharToWordRatio;

  return englishWords + koreanWords;
}

/**
 * 이미지 읽기 시간 계산 (Medium 스타일)
 * 첫 이미지 12초, 이후 -1초씩 감소, 최소 3초
 */
function calculateImageTime(
  count: number,
  firstTime: number,
  decrement: number,
  minTime: number
): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.max(minTime, firstTime - i * decrement);
  }
  return total;
}
