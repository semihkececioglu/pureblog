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

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const authors = await Author.find().sort({ name: 1 }).lean();
    return NextResponse.json({ data: authors, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch authors" }, { status: 500 });
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
    const author = await Author.create(data);
    return NextResponse.json({ data: author, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to create author" }, { status: 500 });
  }
}
