export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { IPost, ICategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PostsTable } from "./posts-table";

async function getPosts() {
  await connectDB();
  const posts = await Post.find()
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();
  return posts as unknown as (IPost & { category: ICategory; _id: string })[];
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Posts</h1>
        <Button>
          <Link href="/admin/posts/new" className="flex items-center gap-2">
            <Plus width={16} height={16} />
            New Post
          </Link>
        </Button>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}
