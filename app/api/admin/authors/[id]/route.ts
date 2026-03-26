import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Author from "@/models/Author";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  social: z
    .object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();
    const author = await Author.findByIdAndUpdate(id, data, { new: true });
    if (!author) {
      return NextResponse.json({ data: null, error: "Author not found" }, { status: 404 });
    }
    return NextResponse.json({ data: author, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update author" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    await Author.findByIdAndDelete(id);
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete author" }, { status: 500 });
  }
}
