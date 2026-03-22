export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import PostSeries from "@/models/PostSeries";
import { IPostSeries } from "@/types";
import { SeriesList } from "./series-list";

async function getSeries() {
  await connectDB();
  const series = await PostSeries.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(series)) as (IPostSeries & { _id: string })[];
}

export default async function AdminSeriesPage() {
  const series = await getSeries();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Series</h1>
      <SeriesList initialSeries={series} />
    </div>
  );
}
