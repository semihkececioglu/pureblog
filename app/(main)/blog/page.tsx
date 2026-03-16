import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "All posts, sorted by date.",
  path: "/blog",
});

const POSTS_PER_PAGE = 6;

async function getPosts(page: number, limit: number) {
  await connectDB();
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find({ status: "published" })
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments({ status: "published" }),
  ]);
  return {
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, total } = await getPosts(page, POSTS_PER_PAGE);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  // Build visible page numbers (max 5 shown)
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-muted-foreground">All posts, sorted by date.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground col-span-2">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-12">
          {/* Previous */}
          {page > 1 ? (
            <Link
              href={`/blog?page=${page - 1}`}
              className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-mono text-xs"
            >
              ←
            </Link>
          ) : (
            <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed font-mono text-xs">
              ←
            </span>
          )}

          {/* Page numbers */}
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex items-center justify-center w-9 h-9 font-mono text-xs text-muted-foreground/40"
              >
                …
              </span>
            ) : p === page ? (
              <span
                key={p}
                className="flex items-center justify-center w-9 h-9 border border-foreground bg-foreground text-background font-mono text-xs"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={`/blog?page=${p}`}
                className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-mono text-xs"
              >
                {p}
              </Link>
            )
          )}

          {/* Next */}
          {page < totalPages ? (
            <Link
              href={`/blog?page=${page + 1}`}
              className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-mono text-xs"
            >
              →
            </Link>
          ) : (
            <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed font-mono text-xs">
              →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
