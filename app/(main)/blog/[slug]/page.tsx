import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { ViewTracker } from "./view-tracker";
import { ReactionBar } from "./reaction-bar";
import { CommentSection } from "./comment-section";
import { siteUrl, siteName } from "@/lib/metadata";
import { ArticleJsonLd } from "@/components/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function relativeDate(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = await Post.findOne({ slug, status: "published" })
    .populate("category", "name")
    .lean() as unknown as (IPost & { category: ICategory }) | null;

  if (!post) return {};

  const url = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.coverImage ?? `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`;

  return {
    title: `${post.title} | ${siteName}`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [siteName],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
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
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        publishedAt={post.publishedAt!}
        updatedAt={post.updatedAt}
        slug={post.slug}
        coverImage={post.coverImage}
      />
      <ViewTracker slug={slug} />

      <header className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl overflow-hidden border border-border mb-6">
          <Link
            href={`/categories/${post.category.slug}`}
            className="flex flex-col gap-1 px-4 py-3 bg-muted/40 hover:bg-muted transition-colors border-r border-border"
          >
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Category</span>
            <span className="text-sm font-medium">{post.category.name}</span>
          </Link>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-r border-border md:border-r">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Reading Time</span>
            <span className="text-sm font-medium">{post.readingTime} min</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-t border-r border-border md:border-t-0">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Views</span>
            <span className="text-sm font-medium">{post.views.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-t border-border md:border-t-0">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Published</span>
            <span className="text-sm font-medium">{relativeDate(post.publishedAt!)}</span>
          </div>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {post.coverImage && (
        <div className="relative w-full aspect-video mb-10 overflow-hidden rounded-xl border border-border">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="font-mono text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <ReactionBar slug={slug} initialReactions={post.reactions} />

      {(prev || next) && (
        <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/blog/${(prev as IPost).slug}`}
              className="flex flex-col gap-2 rounded-xl bg-muted/50 p-5 hover:bg-muted transition-colors"
            >
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                ← Previous
              </span>
              <span className="text-sm font-medium leading-snug">
                {(prev as IPost).title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${(next as IPost).slug}`}
              className="flex flex-col gap-2 rounded-xl bg-muted/50 p-5 hover:bg-muted transition-colors text-right items-end"
            >
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Next →
              </span>
              <span className="text-sm font-medium leading-snug">
                {(next as IPost).title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}

      <CommentSection slug={slug} />
    </article>
  );
}
