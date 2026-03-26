export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory, IPostSeries } from "@/types";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSeriesWithPosts(slug: string) {
  await connectDB();
  const series = (await PostSeries.findOne({ slug }).lean()) as unknown as IPostSeries | null;
  if (!series) return null;

  const posts = await Post.find({ series: series._id, status: "published" })
    .populate("category", "name slug")
    .sort({ seriesOrder: 1, publishedAt: 1 })
    .lean();

  return {
    series,
    posts: posts as unknown as (IPost & { category: ICategory })[],
  };
}

export async function generateStaticParams() {
  await connectDB();
  const all = await PostSeries.find().select("slug").lean();
  return all.map((s) => ({ slug: (s as { slug: string }).slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const series = (await PostSeries.findOne({ slug }).lean()) as unknown as IPostSeries | null;
  if (!series) return {};
  const count = await Post.countDocuments({ series: series._id, status: "published" });
  const description =
    series.description ||
    `A ${count}-part series: ${series.name}.`;
  return buildMetadata({ title: series.name, description, path: `/series/${slug}` });
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getSeriesWithPosts(slug);
  if (!result) notFound();

  const { series, posts } = result;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Series", url: `${siteUrl}/series` },
          { name: series.name, url: `${siteUrl}/series/${slug}` },
        ]}
      />

      <Link
        href="/series"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
        All Series
      </Link>

      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Series · {posts.length} {posts.length === 1 ? "part" : "parts"}
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">{series.name}</h1>
        {series.description && (
          <p className="text-muted-foreground leading-relaxed">{series.description}</p>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts in this series yet.</p>
      ) : (
        <ol className="flex flex-col gap-0 border border-border divide-y divide-border">
          {posts.map((post, index) => (
            <li key={String(post._id)}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-5 px-6 py-5 hover:bg-muted/40 transition-colors"
              >
                <span className="font-mono text-2xl font-bold text-muted-foreground/30 shrink-0 leading-tight mt-0.5 w-8 text-right">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg font-bold leading-snug group-hover:underline underline-offset-4 mb-1">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {(post.category as ICategory)?.name && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {(post.category as ICategory).name}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
