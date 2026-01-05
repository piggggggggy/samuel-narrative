import { NextRequest, NextResponse } from "next/server";
import { getContentProvider } from "@/lib/content";
import { isAdmin } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations/post";
import { revalidatePost } from "@/lib/revalidate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 = 전체

    const provider = await getContentProvider();
    const allPosts = await provider.getAllPosts();

    // 페이지네이션이 요청된 경우
    if (limit > 0) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const posts = allPosts.slice(startIndex, endIndex);

      return NextResponse.json({
        posts,
        hasMore: endIndex < allPosts.length,
        total: allPosts.length,
      });
    }

    // 기존 동작: 전체 포스트 반환
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const provider = await getContentProvider();

    if (!provider.createPost) {
      return NextResponse.json(
        { error: "Create operation not supported" },
        { status: 501 }
      );
    }

    const post = await provider.createPost(validation.data);

    // 캐시 revalidate
    revalidatePost(post.slug);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
