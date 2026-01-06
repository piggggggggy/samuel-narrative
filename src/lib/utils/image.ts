import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
};

// GIF, SVG는 압축하지 않음
const SKIP_COMPRESSION_TYPES = ["image/gif", "image/svg+xml"];

// GIF 최대 용량 (2MB)
const GIF_MAX_SIZE = 2 * 1024 * 1024;

export interface CompressResult {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * 이미지 파일을 압축합니다.
 * GIF, SVG는 압축하지 않고 원본 반환합니다.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressResult> {
  const originalSize = file.size;

  // GIF, SVG는 압축 건너뛰기
  if (SKIP_COMPRESSION_TYPES.includes(file.type)) {
    // GIF 용량 체크
    if (file.type === "image/gif" && file.size > GIF_MAX_SIZE) {
      throw new Error(
        `GIF 파일은 ${GIF_MAX_SIZE / 1024 / 1024}MB 이하만 업로드 가능합니다.`
      );
    }

    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
      useWebWorker: true,
      fileType: "image/webp",
    });

    // WebP로 변환된 경우 파일명 확장자 변경
    const newName = file.name.replace(/\.[^/.]+$/, ".webp");
    const webpFile = new File([compressed], newName, { type: "image/webp" });

    return {
      file: webpFile,
      wasCompressed: true,
      originalSize,
      compressedSize: webpFile.size,
    };
  } catch (error) {
    // 압축 실패 시 원본 반환 (WebP 미지원 브라우저 등)
    console.warn("Image compression failed, using original:", error);
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

/**
 * 압축 결과를 로그로 출력합니다.
 */
export function logCompressionResult(result: CompressResult): void {
  if (result.wasCompressed) {
    const savedPercent = Math.round(
      (1 - result.compressedSize / result.originalSize) * 100
    );
    console.log(
      `Image compressed: ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${savedPercent}% saved)`
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
