import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import "@/models/Author";
import { auth } from "@/auth";
import { ICategory, IAuthor } from "@/types";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const posts = await Post.find()
      .populate("category", "name")
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();

    const header = "Title,Slug,Status,Author,Views,Hearts,Category,Tags,Published At,Created At";
    const rows = posts.map((p) => {
      const title = `"${String(p.title).replace(/"/g, '""')}"`;
      const slug = p.slug;
      const status = p.status;
      const author = p.author ? `"${((p.author as unknown as IAuthor).name ?? "").replace(/"/g, '""')}"` : "";
      const views = p.views ?? 0;
      const hearts = p.reactions?.heart ?? 0;
      const category = p.category ? `"${((p.category as unknown as ICategory).name ?? "").replace(/"/g, '""')}"` : "";
      const tags = `"${(p.tags ?? []).join(", ")}"`;
      const publishedAt = p.publishedAt ? new Date(p.publishedAt).toISOString().split("T")[0] : "";
      const createdAt = new Date(p.createdAt).toISOString().split("T")[0];
      return `${title},${slug},${status},${author},${views},${hearts},${category},${tags},${publishedAt},${createdAt}`;
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="posts-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to export posts" }, { status: 500 });
  }
}
