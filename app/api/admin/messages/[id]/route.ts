import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete message" }, { status: 500 });
  }
}
