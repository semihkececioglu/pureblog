import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";
import { sendCommentApprovedNotification } from "@/lib/mailer";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = schema.parse(body);

    await connectDB();
    const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true })
      .populate("postId", "title slug")
      .lean() as unknown as { name: string; email: string; postId: { title: string; slug: string } } | null;

    if (status === "approved" && comment) {
      const post = comment.postId as unknown as { title: string; slug: string };
      sendCommentApprovedNotification(comment.email, comment.name, post.title, post.slug).catch(console.error);
    }

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    await Comment.findByIdAndDelete(id);
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete comment" }, { status: 500 });
  }
}
