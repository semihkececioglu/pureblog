export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { ISubscriber } from "@/types";
import { SubscribersTable } from "./subscribers-table";

const PAGE_SIZE = 10;

interface SearchParams {
  q?: string;
  status?: string;
  page?: string;
}

async function getSubscribers(sp: SearchParams) {
  await connectDB();

  const page = Math.max(1, Number(sp.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const filter: Record<string, unknown> = {};
  if (sp.q) filter.email = { $regex: sp.q, $options: "i" };
  if (sp.status && sp.status !== "all") filter.status = sp.status;

  const [subscribers, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Subscriber.countDocuments(filter),
  ]);

  return {
    subscribers: JSON.parse(JSON.stringify(subscribers)) as (ISubscriber & { _id: string })[],
    total,
  };
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { subscribers, total } = await getSubscribers(sp);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Subscribers
      </h1>
      <Suspense>
        <SubscribersTable subscribers={subscribers} totalCount={total} />
      </Suspense>
    </div>
  );
}
