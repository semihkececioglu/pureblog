export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { TagList } from "./tag-list";
import type { PipelineStage } from "mongoose";

async function getTagsWithCount(q?: string) {
  await connectDB();
  const pipeline: PipelineStage[] = [
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, name: "$_id", count: 1 } },
  ];
  if (q) pipeline.push({ $match: { name: { $regex: q, $options: "i" } } });
  const result = await Post.aggregate(pipeline);
  return result as { name: string; count: number }[];
}

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const tags = await getTagsWithCount(q);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Tags
      </h1>
      <Suspense>
        <TagList initialTags={tags} />
      </Suspense>
    </div>
  );
}
