export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { ISubscriber } from "@/types";
import { SubscribersTable } from "./subscribers-table";

async function getSubscribers() {
  await connectDB();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return subscribers as unknown as (ISubscriber & { _id: string })[];
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Subscribers
      </h1>
      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}
