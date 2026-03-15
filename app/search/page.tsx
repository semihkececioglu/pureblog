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
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          Search
        </h1>
        {q && (
          <p className="text-muted-foreground">
            {posts.length} result{posts.length !== 1 ? "s" : ""} for{" "}
            <span className="text-foreground font-medium">&quot;{q}&quot;</span>
          </p>
        )}
      </header>

      <div className="flex flex-col gap-6">
        {!q ? (
          <p className="text-muted-foreground">
            Enter a search term to find posts.
          </p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts found for &quot;{q}&quot;.
          </p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>
    </div>
  );
}
