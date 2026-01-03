import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 인증 확인
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paths, tags } = body as {
      paths?: string[];
      tags?: string[];
    };

    const revalidated: { paths: string[]; tags: string[] } = {
      paths: [],
      tags: [],
    };

    // 경로 revalidate
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.paths.push(path);
      }
    }

    // 태그 revalidate
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag, "max");
        revalidated.tags.push(tag);
      }
    }

    return NextResponse.json({
      revalidated: true,
      ...revalidated,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
