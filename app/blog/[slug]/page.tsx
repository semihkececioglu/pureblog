import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { IPost, ICategory } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  await connectDB();
  const post = await Post.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .lean();
  return post as unknown as (IPost & { category: ICategory }) | null;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {post.category.name}
          </span>
          <span className="text-border">—</span>
          <span className="font-mono text-xs text-muted-foreground">
            {post.readingTime} min read
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
