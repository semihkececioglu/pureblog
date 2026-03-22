import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { sendToSubscribers } from "@/lib/mailer";

// Vercel Cron: her saat başı çalıştır
// vercel.json: { "crons": [{ "path": "/api/cron/publish", "schedule": "0 * * * *" }] }
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const scheduled = await Post.find({
    status: "draft",
    scheduledAt: { $lte: now },
  }).lean() as unknown as { _id: string; title: string; excerpt: string; slug: string }[];

  if (!scheduled.length) {
    return NextResponse.json({ published: 0 });
  }

  await Promise.all(
    scheduled.map(async (post) => {
      await Post.findByIdAndUpdate(post._id, {
        status: "published",
        publishedAt: now,
        scheduledAt: null,
      });
      sendToSubscribers(post.title, post.excerpt, post.slug).catch(console.error);
    })
  );

  return NextResponse.json({ published: scheduled.length });
}
