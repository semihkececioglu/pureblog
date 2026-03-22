export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import PostSeries from "@/models/PostSeries";
import { IPost, ICategory, IPostSeries } from "@/types";
import { SeriesNavigation } from "@/components/series-navigation";
import { ViewCounter } from "./view-tracker";
import { ReactionBar } from "./reaction-bar";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { CommentSection } from "./comment-section";
import { siteUrl, siteName } from "@/lib/metadata";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { TableOfContents } from "@/components/table-of-contents";
import { addHeadingIds, extractHeadings } from "@/lib/toc";
import { RelatedPosts } from "@/components/related-posts";
import { BackToTop } from "@/components/back-to-top";
import { ShareButtons } from "@/components/share-buttons";
import { calcReadingTime } from "@/lib/reading-time";
import DOMPurify from "isomorphic-dompurify";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = (await Post.findOne({ slug, status: "published" })
    .populate("category", "name")
    .lean()) as unknown as (IPost & { category: ICategory }) | null;

  if (!post) return {};

  const url = `${siteUrl}/blog/${post.slug}`;
  const ogImage =
    post.coverImage ??
    `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`;

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

async function getRelatedPosts(
  categoryId: import("mongoose").Types.ObjectId,
  currentSlug: string,
) {
  return Post.find({
    status: "published",
    category: categoryId,
    slug: { $ne: currentSlug },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select("title slug excerpt coverImage content publishedAt")
    .lean() as unknown as IPost[];
}

async function getSeriesData(seriesId: import("mongoose").Types.ObjectId) {
  const [series, posts] = await Promise.all([
    PostSeries.findById(seriesId).lean() as Promise<IPostSeries | null>,
    Post.find({ series: seriesId, status: "published" })
      .select("title slug seriesOrder")
      .lean() as Promise<{ slug: string; title: string; seriesOrder: number }[]>,
  ]);
  return series ? { series, posts } : null;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [{ prev, next }, related, seriesData] = await Promise.all([
    getAdjacentPosts(post.publishedAt!),
    getRelatedPosts(post.category._id, post.slug),
    post.series ? getSeriesData(post.series as unknown as import("mongoose").Types.ObjectId) : null,
  ]);
  const rawContent = addHeadingIds(post.content);
  const contentWithIds = DOMPurify.sanitize(rawContent, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["id", "class", "target", "rel"],
  });
  const headings = extractHeadings(contentWithIds);
  const readingTime = calcReadingTime(post.content);
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <>
      <ShareButtons
        title={post.title}
        url={postUrl}
        slug={post.slug}
        excerpt={post.excerpt}
        prevSlug={prev ? (prev as IPost).slug : undefined}
        nextSlug={next ? (next as IPost).slug : undefined}
      />
      <article className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <ArticleJsonLd
          title={post.title}
          description={post.excerpt}
          publishedAt={post.publishedAt!}
          updatedAt={post.updatedAt}
          slug={post.slug}
          coverImage={post.coverImage}
        />
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: siteUrl },
            { name: post.category.name, url: `${siteUrl}/categories/${post.category.slug}` },
            { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
          ]}
        />

        <header className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-snug">
            {post.excerpt}
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl overflow-hidden border border-border mb-8">
          <Link
            href={`/categories/${post.category.slug}`}
            className="flex flex-col gap-1 px-4 py-3 bg-muted/40 hover:bg-muted transition-colors border-r border-border"
          >
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Category
            </span>
            <span className="text-sm font-medium">{post.category.name}</span>
          </Link>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-r border-border md:border-r">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Reading Time
            </span>
            <span className="text-sm font-medium">{readingTime} min</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-t border-r border-border md:border-t-0">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Views
            </span>
            <ViewCounter slug={slug} initialViews={post.views} />
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-t border-border md:border-t-0">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Published
            </span>
            <span className="text-sm font-medium">
              {formatDate(post.publishedAt!)}
            </span>
          </div>
        </div>

        {post.coverImage && (
          <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-xl border border-border">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {headings.length > 0 && <TableOfContents headings={headings} />}

        {seriesData && (
          <SeriesNavigation
            seriesName={(seriesData.series as IPostSeries).name}
            posts={seriesData.posts}
            currentSlug={post.slug}
          />
        )}

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        <div className="mt-10 mb-4">
          <ReactionBar slug={slug} initialReactions={post.reactions} />
        </div>

        <div
          className="relative h-2 overflow-hidden border-y border-border mb-6"
          style={{
            width: "min(100vw, 48rem)",
            marginLeft:
              "calc((min(100vw, 48rem) - min(100vw, 42rem)) * -0.5 - 1rem)",
          }}
        >
          <StripedPattern direction="right" className="text-border" />
        </div>

        {post.tags && post.tags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
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
            <div
              className="relative h-2 overflow-hidden border-y border-border mb-6"
              style={{
                width: "min(100vw, 48rem)",
                marginLeft:
                  "calc((min(100vw, 48rem) - min(100vw, 42rem)) * -0.5 - 1rem)",
              }}
            >
              <StripedPattern direction="right" className="text-border" />
            </div>
          </>
        )}

        {(prev || next) && (
          <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/blog/${(prev as IPost).slug}`}
                className="group flex flex-col gap-2 rounded-xl bg-muted/50 p-5 hover:bg-muted transition-colors"
              >
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-1" />{" "}
                  Previous
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
                className="group flex flex-col gap-2 rounded-xl bg-muted/50 p-5 hover:bg-muted transition-colors text-right items-end"
              >
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  Next{" "}
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
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

        {related.length > 0 && <RelatedPosts posts={related} />}

        <CommentSection slug={slug} />
        <BackToTop />
      </article>
    </>
  );
}
