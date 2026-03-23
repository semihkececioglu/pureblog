export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import "@/models/Post";
import { IComment } from "@/types";
import { CommentModerationList } from "./comment-moderation-list";

type CommentWithPost = IComment & {
  _id: string;
  postId: { _id: string; title: string; slug: string } | null;
};

const PAGE_SIZE = 10;

interface SearchParams {
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
}

async function getComments(sp: SearchParams) {
  await connectDB();

  const page = Math.max(1, Number(sp.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const filter: Record<string, unknown> = {};
  if (sp.status && sp.status !== "all") filter.status = sp.status;
  if (sp.q) {
    filter.$or = [
      { name: { $regex: sp.q, $options: "i" } },
      { email: { $regex: sp.q, $options: "i" } },
      { content: { $regex: sp.q, $options: "i" } },
    ];
  }

  const sortDir = sp.sort === "asc" ? 1 : -1;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: sortDir })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("postId", "title slug")
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return {
    comments: JSON.parse(JSON.stringify(comments)) as CommentWithPost[],
    total,
  };
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { comments, total } = await getComments(sp);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Comments
      </h1>
      <Suspense>
        <CommentModerationList initialComments={comments} totalCount={total} />
      </Suspense>
    </div>
  );
}
