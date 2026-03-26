export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { buildMetadata, siteUrl } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tags",
  description: "Browse all topics and tags.",
  path: "/tags",
});

async function getTags() {
  await connectDB();
  const tags = await Post.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
  return tags as { _id: string; count: number }[];
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Tags", url: `${siteUrl}/tags` },
        ]}
      />

      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Browse
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight">Tags</h1>
      </header>

      {tags.length === 0 ? (
        <p className="text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ _id: tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="group flex items-center gap-1.5 font-mono text-sm px-3 py-1.5 rounded-full border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
            >
              <span>#{tag}</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-background/70 transition-colors">
                {count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
