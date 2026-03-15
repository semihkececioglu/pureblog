export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Message from "@/models/Message";
import Subscriber from "@/models/Subscriber";

async function getStats() {
  await connectDB();
  const [posts, comments, messages, subscribers] = await Promise.all([
    Post.countDocuments({ status: "published" }),
    Comment.countDocuments({ status: "pending" }),
    Message.countDocuments({ read: false }),
    Subscriber.countDocuments({ status: "active" }),
  ]);
  return { posts, comments, messages, subscribers };
}

const stats = [
  { key: "posts", label: "Published Posts" },
  { key: "comments", label: "Pending Comments" },
  { key: "messages", label: "Unread Messages" },
  { key: "subscribers", label: "Subscribers" },
] as const;

export default async function AdminPage() {
  const data = await getStats();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ key, label }) => (
          <div key={key} className="border border-border p-6">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className="font-serif text-3xl font-bold">{data[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
