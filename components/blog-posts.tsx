import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import "@/models/Category";
import { IPost, ICategory } from "@/types";

const POSTS_PER_PAGE = 6;

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { publishedAt: -1 },
  oldest: { publishedAt: 1 },
  popular: { views: -1 },
};

async function getPosts(
  page: number,
  category: string,
  sort: string,
  search: string
) {
  await connectDB();
  const skip = (page - 1) * POSTS_PER_PAGE;
  const sortOrder = SORT_MAP[sort] ?? SORT_MAP.newest;

  const filter: Record<string, unknown> = { status: "published" };

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) filter.category = (cat as { _id: unknown })._id;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort(sortOrder)
      .skip(skip)
      .limit(POSTS_PER_PAGE)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

interface BlogPostsProps {
  page: number;
  category: string;
  sort: string;
  search: string;
  view: "grid" | "list";
}

export async function BlogPosts({
  page,
  category,
  sort,
  search,
  view,
}: BlogPostsProps) {
  const { posts, total } = await getPosts(page, category, sort, search);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (search) params.set("search", search);
    if (view !== "grid") params.set("view", view);
    return `/blog?${params.toString()}`;
  };

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
    <>
      {posts.length === 0 ? (
        <p className="text-muted-foreground col-span-2">No posts found.</p>
      ) : view === "list" ? (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={String(post._id)} post={post} view="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={String(post._id)} post={post} view="grid" />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-12">
          {page > 1 ? (
            <Link
              href={buildPageHref(page - 1)}
              className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
            </span>
          )}

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
                href={buildPageHref(p)}
                className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-mono text-xs"
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link
              href={buildPageHref(page + 1)}
              className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </>
  );
}
