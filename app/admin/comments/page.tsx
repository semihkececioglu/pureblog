import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { IComment } from "@/types";
import { CommentModerationList } from "./comment-moderation-list";

async function getComments() {
  await connectDB();
  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .lean();
  return comments as unknown as (IComment & { _id: string })[];
}

export default async function AdminCommentsPage() {
  const comments = await getComments();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Comments
      </h1>
      <CommentModerationList initialComments={comments} />
    </div>
  );
}
