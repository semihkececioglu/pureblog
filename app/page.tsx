import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { buildMetadata, siteUrl, siteName } from "@/lib/metadata";
import { WebsiteJsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Thoughts on technology, design, and everything in between.",
});

async function getPosts() {
  await connectDB();
  const posts = await Post.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <WebsiteJsonLd siteUrl={siteUrl} siteName={siteName} />
      <section className="mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to PureBlog
        </h1>
        <p className="text-muted-foreground text-lg">
          Thoughts on technology, design, and everything in between.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-8">Recent Posts</h2>
        <div className="flex flex-col gap-6">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet.</p>
          ) : (
            posts.map((post) => <PostCard key={String(post._id)} post={post} />)
          )}
        </div>
      </section>
    </div>
  );
}
