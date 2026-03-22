import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    await connectDB();

    const posts = await Post.find(
      { $text: { $search: q }, status: "published" },
      { score: { $meta: "textScore" }, title: 1, slug: 1, excerpt: 1, publishedAt: 1 },
    )
      .populate("category", "name slug")
      .sort({ score: { $meta: "textScore" } })
      .limit(8)
      .lean();

    return NextResponse.json({ data: posts });
  } catch {
    return NextResponse.json({ data: [], error: "Search failed" }, { status: 500 });
  }
}
