import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["heart"]),
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { type } = schema.parse(body);

    await connectDB();

    await Post.findOneAndUpdate(
      { slug },
      { $inc: { [`reactions.${type}`]: 1 } },
    );

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to update reaction" },
      { status: 500 },
    );
  }
}
