import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { z } from "zod";
import { sendCommentNotification } from "@/lib/mailer";
import { rateLimit, getIP } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  content: z.string().min(10).max(1000),
  parentCommentId: z.string().optional(),
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

    const raw = await Comment.find({
      postId: (post as unknown as { _id: string })._id,
      status: "approved",
    })
      .sort({ createdAt: 1 })
      .lean();

    const comments = raw.map((c) => ({
      ...c,
      _id: String(c._id),
      parentCommentId: c.parentCommentId ? String(c.parentCommentId) : undefined,
    }));

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
  const ip = getIP(req);
  const rl = rateLimit(`comment:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { data: null, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    const { name, email, content, parentCommentId } = schema.parse(body);

    await connectDB();

    const post = await Post.findOne({ slug }).select("_id title").lean() as unknown as { _id: string; title: string } | null;
    if (!post)
      return NextResponse.json(
        { data: null, error: "Post not found" },
        { status: 404 },
      );

    await Comment.create({
      postId: post._id,
      ...(parentCommentId ? { parentCommentId } : {}),
      name,
      email,
      content,
      status: "pending",
    });

    sendCommentNotification(post.title, slug, name, content).catch(console.error);

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
