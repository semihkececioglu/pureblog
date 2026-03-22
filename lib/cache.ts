import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import { ICategory } from "@/types";

export const getCachedCategories = unstable_cache(
  async (): Promise<ICategory[]> => {
    await connectDB();
    const cats = await Category.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(cats));
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getCachedCategoriesWithCount = unstable_cache(
  async (): Promise<(ICategory & { postCount: number })[]> => {
    await connectDB();
    const categories = (await Category.find()
      .sort({ name: 1 })
      .lean()) as unknown as ICategory[];

    const withCount = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        postCount: await Post.countDocuments({
          category: cat._id,
          status: "published",
        }),
      }))
    );

    return JSON.parse(JSON.stringify(withCount));
  },
  ["categories-with-count"],
  { revalidate: 300, tags: ["categories"] }
);
