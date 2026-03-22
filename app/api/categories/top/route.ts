import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import { ICategory } from "@/types";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const [counts, categories] = await Promise.all([
      Post.aggregate<{ _id: unknown; postCount: number }>([
        { $match: { status: "published" } },
        { $group: { _id: "$category", postCount: { $sum: 1 } } },
      ]),
      Category.find().lean() as unknown as Promise<ICategory[]>,
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.postCount]));
    const top = categories
      .map((cat) => ({
        _id: String(cat._id),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        postCount: countMap.get(String(cat._id)) ?? 0,
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 4);

    return NextResponse.json({ data: top, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
