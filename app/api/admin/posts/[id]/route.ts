import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";
import { sendToSubscribers } from "@/lib/mailer";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10).max(160),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  coverImage: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]),
  scheduledAt: z.string().nullable().optional(),
  series: z.string().nullable().optional(),
  seriesOrder: z.number().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);

    await connectDB();

    const existing = await Post.findById(id).select("status").lean();

    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        publishedAt: data.status === "published" ? new Date() : undefined,
      },
      { new: true },
    );

    if (!post) {
      return NextResponse.json(
        { data: null, error: "Post not found" },
        { status: 404 },
      );
    }

    if (existing?.status === "draft" && data.status === "published") {
      sendToSubscribers(post.title, post.excerpt, post.slug).catch(console.error);
    }

    return NextResponse.json({ data: post, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    await connectDB();

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
