export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { TagList } from "./tag-list";

async function getTagsWithCount() {
  await connectDB();
  const result = await Post.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, name: "$_id", count: 1 } },
  ]);
  return result as { name: string; count: number }[];
}

export default async function AdminTagsPage() {
  const tags = await getTagsWithCount();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Tags
      </h1>
      <TagList initialTags={tags} />
    </div>
  );
}
