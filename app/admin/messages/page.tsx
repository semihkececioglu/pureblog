export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { IMessage } from "@/types";
import { MessageList } from "./message-list";

async function getMessages() {
  await connectDB();
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(messages)) as (IMessage & { _id: string })[];
}

import { Suspense } from "react";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { q?: string; read?: string; page?: string };
}) {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Messages
      </h1>
      <Suspense>
        <MessageList initialMessages={messages} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
