import Link from "next/link";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { IPost, ICategory } from "@/types";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (post: IPost & { _id: string }) => (
        <Link
          href={`/admin/posts/${post._id}`}
          className="hover:underline underline-offset-4 font-medium"
        >
          {post.title}
        </Link>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post: IPost & { category: ICategory }) =>
        post.category?.name ?? "—",
    },
    {
      key: "status",
      label: "Status",
      render: (post: IPost) => (
        <span
          className={`font-mono text-xs uppercase tracking-widest ${
            post.status === "published"
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {post.status}
        </span>
      ),
    },
    {
      key: "views",
      label: "Views",
      render: (post: IPost) => (
        <span className="font-mono text-xs">{post.views}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (post: IPost) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus width={16} height={16} />
            New Post
          </Link>
        </Button>
      </div>
      <DataTable data={posts} columns={columns} searchKey="title" />
    </div>
  );
}
