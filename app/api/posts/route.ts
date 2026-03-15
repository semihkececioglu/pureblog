import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    const posts = await Post.find({ status: "published" })
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .lean();

    return NextResponse.json({ data: posts, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
