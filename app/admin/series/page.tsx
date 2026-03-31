export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import { IPostSeries } from "@/types";
import { SeriesList } from "./series-list";

async function getSeries(q?: string) {
  await connectDB();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const series = await PostSeries.find(filter).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(series)) as (IPostSeries & { _id: string })[];
}

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const series = await getSeries(q);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Series</h1>
      <Suspense>
        <SeriesList initialSeries={series} />
      </Suspense>
    </div>
  );
}
