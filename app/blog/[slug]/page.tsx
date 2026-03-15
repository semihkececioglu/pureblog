import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { IPost, ICategory } from "@/types";
import { ViewTracker } from "./view-tracker";
import { ReactionBar } from "./reaction-bar";
import { CommentSection } from "./comment-section";

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

async function getAdjacentPosts(publishedAt: Date) {
  const [prev, next] = await Promise.all([
    Post.findOne({ status: "published", publishedAt: { $lt: publishedAt } })
      .sort({ publishedAt: -1 })
      .select("title slug")
      .lean(),
    Post.findOne({ status: "published", publishedAt: { $gt: publishedAt } })
      .sort({ publishedAt: 1 })
      .select("title slug")
      .lean(),
  ]);
  return { prev, next };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const { prev, next } = await getAdjacentPosts(post.publishedAt!);

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <ViewTracker slug={slug} />

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {post.category.name}
          </span>
          <span className="text-border">—</span>
          <span className="font-mono text-xs text-muted-foreground">
            {post.readingTime} min read
          </span>
          <span className="text-border">—</span>
          <span className="font-mono text-xs text-muted-foreground">
            {post.views} views
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

      <nav className="mt-16 pt-8 border-t border-border flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/blog/${(prev as IPost).slug}`}
            className="group flex flex-col gap-1 max-w-xs"
          >
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Previous
            </span>
            <span className="text-sm font-medium group-hover:underline underline-offset-4">
              {(prev as IPost).title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/blog/${(next as IPost).slug}`}
            className="group flex flex-col gap-1 items-end max-w-xs"
          >
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Next
            </span>
            <span className="text-sm font-medium group-hover:underline underline-offset-4 text-right">
              {(next as IPost).title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        <ReactionBar slug={slug} initialReactions={post.reactions} />
      </nav>
      <CommentSection slug={slug} />
    </article>
  );
}
