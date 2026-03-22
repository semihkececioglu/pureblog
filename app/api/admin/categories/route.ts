import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    await connectDB();

    const category = await Category.create(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as unknown as (tag: string) => void)("categories");
    return NextResponse.json({ data: category, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
