import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/auth";
import { z } from "zod";

const deleteSchema = z.object({
  tag: z.string().min(1),
});

const renameSchema = z.object({
  oldTag: z.string().min(1),
  newTag: z.string().min(1),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const result = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    return NextResponse.json({ data: result, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tag } = deleteSchema.parse(body);

    await connectDB();
    await Post.updateMany({ tags: tag }, { $pull: { tags: tag } });

    return NextResponse.json({ data: { deleted: tag }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete tag" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldTag, newTag } = renameSchema.parse(body);

    await connectDB();
    await Post.updateMany({ tags: oldTag }, { $set: { "tags.$[el]": newTag } }, {
      arrayFilters: [{ el: oldTag }],
    });

    return NextResponse.json({ data: { oldTag, newTag }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to rename tag" }, { status: 500 });
  }
}
