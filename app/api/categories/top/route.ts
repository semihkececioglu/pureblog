import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import { ICategory } from "@/types";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const categories = (await Category.find()
      .lean()) as unknown as ICategory[];

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => ({
        _id: String(cat._id),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        postCount: await Post.countDocuments({
          category: cat._id,
          status: "published",
        }),
      }))
    );

    const top = categoriesWithCount
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
