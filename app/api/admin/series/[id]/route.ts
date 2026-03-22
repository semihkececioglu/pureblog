import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
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
    const data = patchSchema.parse(body);
    await connectDB();
    const series = await PostSeries.findByIdAndUpdate(id, data, { new: true });
    if (!series) {
      return NextResponse.json({ data: null, error: "Series not found" }, { status: 404 });
    }
    return NextResponse.json({ data: series, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update series" }, { status: 500 });
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
    await PostSeries.findByIdAndDelete(id);
    // Remove series reference from posts
    await Post.updateMany({ series: id }, { $unset: { series: 1, seriesOrder: 1 } });
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete series" }, { status: 500 });
  }
}
