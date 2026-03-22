import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return NextResponse.json({ data: null, error: "Subscriber not found" }, { status: 404 });
    }
    const newStatus = subscriber.status === "active" ? "unsubscribed" : "active";
    subscriber.status = newStatus;
    await subscriber.save();
    return NextResponse.json({ data: { status: newStatus }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    await Subscriber.findByIdAndDelete(id);
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to delete subscriber" }, { status: 500 });
  }
}
