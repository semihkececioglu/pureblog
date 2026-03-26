export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import PostSeries from "@/models/PostSeries";
import { IPostSeries } from "@/types";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { CardWithCorners } from "@/components/structural-lines";

export const metadata: Metadata = buildMetadata({
  title: "Series",
  description: "Browse post series and reading collections.",
  path: "/series",
});

async function getSeriesWithCount() {
  await connectDB();
  const allSeries = (await PostSeries.find().sort({ name: 1 }).lean()) as unknown as (IPostSeries & { _id: string })[];

  const counts = await Promise.all(
    allSeries.map((s) =>
      Post.countDocuments({ series: s._id, status: "published" }),
    ),
  );

  return allSeries
    .map((s, i) => ({ ...s, postCount: counts[i] }))
    .filter((s) => s.postCount > 0);
}

export default async function SeriesPage() {
  const series = await getSeriesWithCount();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Series", url: `${siteUrl}/series` },
        ]}
      />

      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Browse
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-3">Series</h1>
        <p className="text-muted-foreground">Multi-part reading collections.</p>
      </header>

      {series.length === 0 ? (
        <p className="text-muted-foreground">No series yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {series.map((s) => (
            <CardWithCorners key={s._id}>
              <Link
                href={`/series/${s.slug}`}
                className="group flex flex-col gap-2 p-6 hover:bg-muted/40 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-serif text-xl font-bold leading-snug group-hover:underline underline-offset-4">
                    {s.name}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 mt-1">
                    {s.postCount} {s.postCount === 1 ? "part" : "parts"}
                  </span>
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                )}
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-1 inline-flex items-center gap-1">
                  Read series
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </CardWithCorners>
          ))}
        </div>
      )}
    </div>
  );
}
