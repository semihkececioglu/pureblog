import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
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

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
