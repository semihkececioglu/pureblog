import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  posts: z.array(z.object({ postId: z.string(), order: z.number().int().min(1) })),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { posts } = schema.parse(body);
    await connectDB();

    // Remove series from posts no longer in the list
    const keepIds = posts.map((p) => p.postId);
    await Post.updateMany(
      { series: id, _id: { $nin: keepIds } },
      { $unset: { series: 1, seriesOrder: 1 } },
    );

    // Upsert series + order for each post in the list
    await Promise.all(
      posts.map((p) =>
        Post.findByIdAndUpdate(p.postId, { series: id, seriesOrder: p.order }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update series posts" }, { status: 500 });
  }
}
