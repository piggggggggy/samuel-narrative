import { NextResponse } from "next/server";
import { uploadFileToBlob } from "@/lib/content/blob-storage";
import { isAdmin } from "@/lib/auth";

// 허용되는 이미지 타입
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// 최대 파일 크기 (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

// GIF 최대 파일 크기 (2MB) - GIF는 압축되지 않으므로 더 엄격하게 제한
const GIF_MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // 인증 확인
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG" },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (GIF는 더 엄격하게)
    const maxSize = file.type === "image/gif" ? GIF_MAX_SIZE : MAX_SIZE;
    const maxSizeLabel = file.type === "image/gif" ? "2MB" : "5MB";

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${file.type === "image/gif" ? "GIF" : "this type"} is ${maxSizeLabel}` },
        { status: 400 }
      );
    }

    // 파일명 생성 (timestamp + 원본 이름)
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `uploads/${timestamp}-${sanitizedName}`;

    // Vercel Blob에 업로드
    const blob = await uploadFileToBlob(filename, file);

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
