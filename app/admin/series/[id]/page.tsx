export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import Post from "@/models/Post";
import { IPostSeries, IPost } from "@/types";
import { SeriesPosts } from "./series-posts";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  await connectDB();

  const series = (await PostSeries.findById(id).lean()) as unknown as IPostSeries & { _id: string } | null;
  if (!series) return null;

  const [seriesPosts, allPosts] = await Promise.all([
    Post.find({ series: id })
      .select("title slug seriesOrder")
      .sort({ seriesOrder: 1 })
      .lean(),
    Post.find({ $or: [{ series: id }, { series: { $exists: false } }, { series: null }] })
      .select("title slug")
      .sort({ title: 1 })
      .lean(),
  ]);

  return {
    series: JSON.parse(JSON.stringify(series)) as IPostSeries & { _id: string },
    seriesPosts: JSON.parse(JSON.stringify(seriesPosts)) as (Pick<IPost, "title" | "slug" | "seriesOrder"> & { _id: string })[],
    allPosts: JSON.parse(JSON.stringify(allPosts)) as (Pick<IPost, "title" | "slug"> & { _id: string })[],
  };
}

export default async function ManageSeriesPostsPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { series, seriesPosts, allPosts } = data;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/series"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          Series
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-serif text-2xl font-bold tracking-tight">{series.name}</h1>
      </div>

      <SeriesPosts
        seriesId={String(series._id)}
        seriesName={series.name}
        initialSeriesPosts={seriesPosts}
        allPosts={allPosts}
      />
    </div>
  );
}
