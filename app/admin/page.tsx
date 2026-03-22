export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Message from "@/models/Message";
import Subscriber from "@/models/Subscriber";
import "@/models/Category";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CornerMark } from "@/components/structural-lines";

async function getDashboardData() {
  await connectDB();
  const [postCount, commentCount, messageCount, subscriberCount, recentPosts, recentComments, recentMessages] =
    await Promise.all([
      Post.countDocuments({ status: "published" }),
      Comment.countDocuments({ status: "pending" }),
      Message.countDocuments({ read: false }),
      Subscriber.countDocuments({ status: "active" }),
      Post.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title slug views _id")
        .lean(),
      Comment.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("postId", "title slug")
        .lean(),
      Message.find({ read: false })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name email subject _id")
        .lean(),
    ]);
  return {
    stats: { posts: postCount, comments: commentCount, messages: messageCount, subscribers: subscriberCount },
    recentPosts: recentPosts as Array<{ _id: { toString(): string }; title: string; slug: string; views: number }>,
    recentComments: recentComments as unknown as Array<{
      _id: { toString(): string };
      name: string;
      content: string;
      postId: { title: string; slug: string } | null;
    }>,
    recentMessages: recentMessages as Array<{
      _id: { toString(): string };
      name: string;
      subject: string;
    }>,
  };
}

const statConfig = [
  { key: "posts" as const, label: "Published Posts" },
  { key: "comments" as const, label: "Pending Comments" },
  { key: "messages" as const, label: "Unread Messages" },
  { key: "subscribers" as const, label: "Subscribers" },
];

export default async function AdminPage() {
  const { stats, recentPosts, recentComments, recentMessages } = await getDashboardData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Link href="/admin/posts/new" className="flex items-center gap-2">
              <Plus width={14} height={14} />
              New Post
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Link href="/admin/comments">Review Comments</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statConfig.map(({ key, label }) => (
          <div key={key} className="relative border border-border p-6">
            <CornerMark position="top-left" />
            <CornerMark position="bottom-right" />
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className="font-serif text-3xl font-bold">{stats[key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Recent Posts
            </h2>
            <Link
              href="/admin/posts"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post._id.toString()}
                  href={`/admin/posts/${post._id.toString()}`}
                  className="flex items-center justify-between border border-border p-3 hover:border-foreground transition-colors"
                >
                  <span className="text-sm font-medium truncate">{post.title}</span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 ml-2">
                    {post.views} views
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Pending Comments
            </h2>
            <Link
              href="/admin/comments"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending comments.</p>
            ) : (
              recentComments.map((comment) => (
                <div key={comment._id.toString()} className="border border-border p-3">
                  <p className="text-sm font-medium">{comment.name}</p>
                  {comment.postId && (
                    <p className="font-mono text-xs text-muted-foreground">{comment.postId.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Unread Messages
            </h2>
            <Link
              href="/admin/messages"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unread messages.</p>
            ) : (
              recentMessages.map((message) => (
                <Link
                  key={message._id.toString()}
                  href="/admin/messages"
                  className="block border border-border p-3 hover:border-foreground transition-colors"
                >
                  <p className="text-sm font-medium">{message.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
