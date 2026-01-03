import { NextResponse } from "next/server";
import { getContentProvider } from "@/lib/content";
import { isAdmin } from "@/lib/auth";
import { updatePostSchema } from "@/lib/validations/post";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const provider = await getContentProvider();
    const post = await provider.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const provider = await getContentProvider();

    if (!provider.updatePost) {
      return NextResponse.json(
        { error: "Update operation not supported" },
        { status: 501 }
      );
    }

    const post = await provider.updatePost(slug, validation.data);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to update post:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const provider = await getContentProvider();

    if (!provider.deletePost) {
      return NextResponse.json(
        { error: "Delete operation not supported" },
        { status: 501 }
      );
    }

    await provider.deletePost(slug);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete post:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
