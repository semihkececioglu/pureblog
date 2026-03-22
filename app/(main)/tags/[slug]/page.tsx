export const revalidate = 30;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";
import { buildMetadata } from "@/lib/metadata";
import { Pagination } from "@/components/pagination";

const PER_PAGE = 6;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getPostsByTag(tag: string, page: number) {
  await connectDB();
  const skip = (page - 1) * PER_PAGE;
  const filter = { tags: tag, status: "published" };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(PER_PAGE)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const total = await Post.countDocuments({ tags: slug, status: "published" });
  if (total === 0) return {};
  return buildMetadata({
    title: `#${slug}`,
    description: `Explore ${total} ${total === 1 ? "post" : "posts"} tagged with #${slug}.`,
    path: `/tags/${slug}`,
  });
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { posts, total } = await getPostsByTag(slug, page);

  if (total === 0) notFound();

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Tag
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-3">
          #{slug}
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          {total} {total === 1 ? "post" : "posts"}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard key={String(post._id)} post={post} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/tags/${slug}?page=${p}`}
      />
    </div>
  );
}
