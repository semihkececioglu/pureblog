import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    await connectDB();

    await Post.findOneAndUpdate({ slug }, { $inc: { views: 1 } });

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to update views" },
      { status: 500 },
    );
  }
}
