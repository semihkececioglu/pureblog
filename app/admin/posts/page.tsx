export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Author from "@/models/Author";
import "@/models/Category";
import { IAuthor, IPost, ICategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PostsTable } from "./posts-table";

const PAGE_SIZE = 10;

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
  author?: string;
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
  if (sp.author && sp.author !== "all") {
    const auth = await Author.findOne({ slug: sp.author }).select("_id").lean();
    filter.author = auth ? auth._id : null;
  }

  const sortField =
    sp.sort === "title" ? "title" : sp.sort === "views" ? "views" : "createdAt";
  const sortDir = sp.dir === "asc" ? 1 : -1;

  const [posts, total, categories, authors] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .populate("author", "name slug avatar")
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Post.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
    Author.find().sort({ name: 1 }).select("name slug").lean(),
  ]);

  return {
    posts: JSON.parse(JSON.stringify(posts)) as (IPost & { category: ICategory; author?: IAuthor; _id: string })[],
    categories: JSON.parse(JSON.stringify(categories)) as (ICategory & { _id: string })[],
    authors: JSON.parse(JSON.stringify(authors)) as (IAuthor & { _id: string })[],
    total,
  };
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { posts, categories, authors, total } = await getPosts(sp);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Posts</h1>
        <div className="flex items-center gap-2">
          <Button>
            <Link href="/admin/posts/new" className="flex items-center gap-2">
              <Plus width={16} height={16} />
              New Post
            </Link>
          </Button>
        </div>
      </div>
      <Suspense>
        <PostsTable posts={posts} categories={categories} authors={authors} totalCount={total} />
      </Suspense>
    </div>
  );
}
