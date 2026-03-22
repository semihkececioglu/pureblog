import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
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
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) {
      return NextResponse.json({ data: null, error: "Category not found" }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as unknown as (tag: string) => void)("categories");
    return NextResponse.json({ data: category, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update category" }, { status: 500 });
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
    await Category.findByIdAndDelete(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as unknown as (tag: string) => void)("categories");
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
