export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import "@/models/Post";
import { IComment } from "@/types";
import { CommentModerationList } from "./comment-moderation-list";

type CommentWithPost = IComment & {
  _id: string;
  postId: { _id: string; title: string; slug: string } | null;
};

async function getComments() {
  await connectDB();
  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .populate("postId", "title slug")
    .lean();
  return JSON.parse(JSON.stringify(comments)) as CommentWithPost[];
}

import { Suspense } from "react";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; sort?: string; page?: string };
}) {
  const comments = await getComments();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Comments
      </h1>
      <Suspense>
        <CommentModerationList initialComments={comments} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
