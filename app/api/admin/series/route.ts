import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const series = await PostSeries.find().sort({ name: 1 }).lean();
    return NextResponse.json({ data: series, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch series" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();
    const series = await PostSeries.create(data);
    return NextResponse.json({ data: series, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to create series" }, { status: 500 });
  }
}
