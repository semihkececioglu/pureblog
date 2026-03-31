export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import { ICategory } from "@/types";
import { CategoryList } from "./category-list";

async function getCategoriesWithPostCount(q?: string) {
  await connectDB();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const categories = await Category.find(filter).sort({ name: 1 }).lean();

  const postCounts = await Post.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(postCounts.map((p) => [String(p._id), p.count as number]));

  const plain = JSON.parse(JSON.stringify(categories)) as (ICategory & { _id: string })[];
  return plain.map((cat) => ({
    ...cat,
    postCount: countMap.get(cat._id) ?? 0,
  }));
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const categories = await getCategoriesWithPostCount(q);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Categories
      </h1>
      <Suspense>
        <CategoryList initialCategories={categories} />
      </Suspense>
    </div>
  );
}
