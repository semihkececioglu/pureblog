export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { IMessage } from "@/types";
import { MessageList } from "./message-list";

const PAGE_SIZE = 15;

interface SearchParams {
  q?: string;
  read?: string;
  page?: string;
}

async function getMessages(sp: SearchParams) {
  await connectDB();

  const page = Math.max(1, Number(sp.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const filter: Record<string, unknown> = {};
  if (sp.read === "unread") filter.read = false;
  else if (sp.read === "read") filter.read = true;
  if (sp.q) {
    filter.$or = [
      { name: { $regex: sp.q, $options: "i" } },
      { email: { $regex: sp.q, $options: "i" } },
      { subject: { $regex: sp.q, $options: "i" } },
    ];
  }

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Message.countDocuments(filter),
  ]);

  return {
    messages: JSON.parse(JSON.stringify(messages)) as (IMessage & { _id: string })[],
    total,
  };
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { messages, total } = await getMessages(sp);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Messages
      </h1>
      <Suspense>
        <MessageList initialMessages={messages} totalCount={total} />
      </Suspense>
    </div>
  );
}
