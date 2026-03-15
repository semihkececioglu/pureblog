import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PostCard } from "@/components/post-card";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "All posts, sorted by date.",
  path: "/blog",
});
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";

async function getPosts() {
  await connectDB();
  const posts = await Post.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-muted-foreground">All posts, sorted by date.</p>
      </section>

      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>
    </div>
  );
}
