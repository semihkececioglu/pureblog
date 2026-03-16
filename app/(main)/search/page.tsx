import { Search } from "lucide-react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchPosts(query: string) {
  await connectDB();
  const posts = await Post.find(
    { $text: { $search: query }, status: "published" },
    { score: { $meta: "textScore" } },
  )
    .populate("category", "name slug")
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const posts = q && q.trim().length > 0 ? await searchPosts(q) : [];

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
            {posts.length} result{posts.length !== 1 ? "s" : ""} for{" "}
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
    </div>
  );
}
