import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json({ data: categories, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
