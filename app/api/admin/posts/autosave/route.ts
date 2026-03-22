import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";

interface AutosaveBody {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string;
  coverImage?: string;
  featured?: boolean;
  series?: string;
  seriesOrder?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as AutosaveBody;
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ data: null, error: "Title required" }, { status: 400 });
    }

    await connectDB();

    const slug =
      body.slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    const tags = body.tags
      ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const update = {
      title,
      slug,
      excerpt: body.excerpt?.trim() || "",
      content: body.content || "",
      ...(body.category ? { category: body.category } : {}),
      tags,
      coverImage: body.coverImage || undefined,
      featured: body.featured ?? false,
      series: body.series || null,
      seriesOrder: body.seriesOrder ? parseInt(body.seriesOrder, 10) : null,
      status: "draft" as const,
    };

    if (body.id) {
      // Update existing draft
      const post = await Post.findByIdAndUpdate(
        body.id,
        { $set: update },
        { new: true, runValidators: false },
      );
      if (!post) {
        return NextResponse.json({ data: null, error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({
        data: { _id: String(post._id), previewToken: post.previewToken, slug: post.slug },
        error: null,
      });
    }

    // Create new draft
    const previewToken = crypto.randomUUID();
    const post = await new Post({ ...update, previewToken }).save({
      validateBeforeSave: false,
    });

    return NextResponse.json({
      data: { _id: String(post._id), previewToken: post.previewToken, slug: post.slug },
      error: null,
    });
  } catch {
    return NextResponse.json({ data: null, error: "Autosave failed" }, { status: 500 });
  }
}
