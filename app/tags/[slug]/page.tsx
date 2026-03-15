import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPostsByTag(tag: string) {
  await connectDB();
  const posts = await Post.find({ tags: tag, status: "published" })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Tag
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          #{slug}
        </h1>
      </header>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={String(post._id)} post={post} />
        ))}
      </div>
    </div>
  );
}
