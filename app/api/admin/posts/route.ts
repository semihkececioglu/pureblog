import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10).max(160),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    await connectDB();

    const wordCount = data.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const post = await Post.create({
      ...data,
      readingTime,
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    return NextResponse.json({ data: post, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to create post" },
      { status: 500 },
    );
  }
}
