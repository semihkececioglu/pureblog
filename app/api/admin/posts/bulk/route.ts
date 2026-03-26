import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["publish", "draft", "delete"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { ids, action } = parsed.data;
    await connectDB();

    if (action === "delete") {
      await Post.deleteMany({ _id: { $in: ids } });
    } else {
      const status = action === "publish" ? "published" : "draft";
      const update: Record<string, unknown> = { status };
      if (action === "publish") update.publishedAt = new Date();
      await Post.updateMany({ _id: { $in: ids } }, { $set: update });
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
