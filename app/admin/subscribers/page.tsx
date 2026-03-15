import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { ISubscriber } from "@/types";
import { DataTable } from "@/components/data-table";

async function getSubscribers() {
  await connectDB();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return subscribers as unknown as (ISubscriber & { _id: string })[];
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers();

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (s: ISubscriber) => (
        <span className="font-mono text-xs uppercase tracking-widest">{s.status}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (s: ISubscriber) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Subscribers
      </h1>
      <DataTable data={subscribers} columns={columns} searchKey="email" />
    </div>
  );
}
