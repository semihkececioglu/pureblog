import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { IMessage } from "@/types";
import { MessageList } from "./message-list";

async function getMessages() {
  await connectDB();
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  return messages as unknown as (IMessage & { _id: string })[];
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Messages
      </h1>
      <MessageList initialMessages={messages} />
    </div>
  );
}
