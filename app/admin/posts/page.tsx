export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { PostsTable } from "./posts-table";

const PAGE_SIZE = 10;

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

async function getPosts(sp: SearchParams) {
  await connectDB();

  const page = Math.max(1, Number(sp.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const filter: Record<string, unknown> = {};
  if (sp.status && sp.status !== "all") filter.status = sp.status;
  if (sp.q) filter.title = { $regex: sp.q, $options: "i" };
  if (sp.category && sp.category !== "all") {
    const cat = await Category.findOne({ slug: sp.category }).select("_id").lean();
    filter.category = cat ? cat._id : null;
  }

  const sortField =
    sp.sort === "title" ? "title" : sp.sort === "views" ? "views" : "createdAt";
  const sortDir = sp.dir === "asc" ? 1 : -1;

  const [posts, total, categories] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Post.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  return {
    posts: JSON.parse(JSON.stringify(posts)) as (IPost & { category: ICategory; _id: string })[],
    categories: JSON.parse(JSON.stringify(categories)) as (ICategory & { _id: string })[],
    total,
  };
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { posts, categories, total } = await getPosts(sp);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Posts</h1>
        <div className="flex items-center gap-2">
          <Link href="/api/admin/posts/export">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download width={14} height={14} />
              Export CSV
            </Button>
          </Link>
          <Button>
            <Link href="/admin/posts/new" className="flex items-center gap-2">
              <Plus width={16} height={16} />
              New Post
            </Link>
          </Button>
        </div>
      </div>
      <Suspense>
        <PostsTable posts={posts} categories={categories} totalCount={total} />
      </Suspense>
    </div>
  );
}
