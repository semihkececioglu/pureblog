import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  content: z.string().min(10).max(1000),
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    await connectDB();

    const post = await Post.findOne({ slug }).select("_id").lean();
    if (!post) return NextResponse.json({ data: [], error: null });

    const comments = await Comment.find({
      postId: (post as unknown as { _id: string })._id,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: comments, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { name, email, content } = schema.parse(body);

    await connectDB();

    const post = await Post.findOne({ slug }).select("_id").lean();
    if (!post)
      return NextResponse.json(
        { data: null, error: "Post not found" },
        { status: 404 },
      );

    await Comment.create({
      postId: (post as unknown as { _id: string })._id,
      name,
      email,
      content,
      status: "pending",
    });

    return NextResponse.json({
      data: null,
      error: null,
      message: "Comment submitted for review.",
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to submit comment" },
      { status: 500 },
    );
  }
}
