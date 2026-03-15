"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { IPost, ICategory } from "@/types";

type PostRow = IPost & { category: ICategory; _id: string };

const columns = [
  {
    key: "title",
    label: "Title",
    render: (post: PostRow) => (
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
    render: (post: PostRow) => post.category?.name ?? "—",
  },
  {
    key: "status",
    label: "Status",
    render: (post: PostRow) => (
      <span
        className={`font-mono text-xs uppercase tracking-widest ${
          post.status === "published" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {post.status}
      </span>
    ),
  },
  {
    key: "views",
    label: "Views",
    render: (post: PostRow) => (
      <span className="font-mono text-xs">{post.views}</span>
    ),
  },
  {
    key: "createdAt",
    label: "Date",
    render: (post: PostRow) => (
      <span className="font-mono text-xs text-muted-foreground">
        {new Date(post.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export function PostsTable({ posts }: { posts: PostRow[] }) {
  return <DataTable data={posts} columns={columns} searchKey="title" />;
}
