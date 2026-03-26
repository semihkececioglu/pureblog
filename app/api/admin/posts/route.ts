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
  author: z.string().nullable().optional(),
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

    const previewToken = crypto.randomUUID();
    const post = await Post.create({
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      publishedAt: data.status === "published" ? new Date() : undefined,
      series: data.series ?? undefined,
      seriesOrder: data.seriesOrder ?? undefined,
      author: data.author ?? undefined,
      previewToken,
    });

    if (data.status === "published") {
      sendToSubscribers(data.title, data.excerpt, data.slug).catch(console.error);
    }

    return NextResponse.json({ data: post, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to create post" },
      { status: 500 },
    );
  }
}
