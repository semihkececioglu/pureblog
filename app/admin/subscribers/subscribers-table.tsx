"use client";

import { DataTable } from "@/components/data-table";
import { ISubscriber } from "@/types";

type SubscriberRow = ISubscriber & { _id: string };

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (s: SubscriberRow) => (
      <span className="font-mono text-xs uppercase tracking-widest">{s.status}</span>
    ),
  },
  {
    key: "createdAt",
    label: "Date",
    render: (s: SubscriberRow) => (
      <span className="font-mono text-xs text-muted-foreground">
        {new Date(s.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export function SubscribersTable({ subscribers }: { subscribers: SubscriberRow[] }) {
  return <DataTable data={subscribers} columns={columns} searchKey="email" />;
}
