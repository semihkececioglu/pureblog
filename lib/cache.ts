import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import Settings from "@/models/Settings";
import { ICategory, ISettings } from "@/types";

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
    const [counts, categories] = await Promise.all([
      Post.aggregate<{ _id: unknown; postCount: number }>([
        { $match: { status: "published" } },
        { $group: { _id: "$category", postCount: { $sum: 1 } } },
      ]),
      Category.find().sort({ name: 1 }).lean() as unknown as Promise<ICategory[]>,
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.postCount]));
    const withCount = categories
      .map((cat) => ({ ...cat, postCount: countMap.get(String(cat._id)) ?? 0 }))
      .sort((a, b) => b.postCount - a.postCount);
    return JSON.parse(JSON.stringify(withCount));
  },
  ["categories-with-count"],
  { revalidate: 300, tags: ["categories"] }
);

export const getCachedSettings = unstable_cache(
  async (): Promise<Partial<ISettings>> => {
    await connectDB();
    const settings = await Settings.findOne().lean();
    return JSON.parse(JSON.stringify(settings ?? {}));
  },
  ["settings"],
  { revalidate: 300, tags: ["settings"] }
);
