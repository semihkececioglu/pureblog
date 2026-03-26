import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { Search } from "lucide-react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search posts by keyword.",
  path: "/search",
});

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function searchPosts(query: string, page: number) {
  await connectDB();
  const skip = (page - 1) * PAGE_SIZE;
  const filter = { $text: { $search: query }, status: "published" };
  const projection = { score: { $meta: "textScore" } };
  const [posts, total] = await Promise.all([
    Post.find(filter, projection)
      .populate("category", "name slug")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Post.countDocuments(filter),
  ]);
  return { posts: posts as unknown as (IPost & { category: ICategory })[], total };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const { posts, total } = q && q.trim().length > 0
    ? await searchPosts(q, page)
    : { posts: [], total: 0 };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-8">
          Search
        </h1>

        <form action="/search" method="GET">
          <div className="flex items-center gap-2 border border-border px-4 py-2.5 focus-within:border-foreground transition-colors">
            <Search width={15} height={15} className="text-muted-foreground shrink-0" />
            <input
              name="q"
              type="text"
              defaultValue={q ?? ""}
              placeholder="Search posts..."
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {q && (
          <p className="text-muted-foreground text-sm mt-4">
            {total} result{total !== 1 ? "s" : ""} for{" "}
            <span className="text-foreground font-medium">&quot;{q}&quot;</span>
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!q ? (
          <p className="text-muted-foreground col-span-2">
            Enter a search term to find posts.
          </p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground col-span-2">
            No posts found for &quot;{q}&quot;.
          </p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>

      {q && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
        />
      )}
    </div>
  );
}
