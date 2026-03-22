import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { auth } from "@/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();

    const header = "Email,Status,Subscribed At";
    const rows = subscribers.map((s) => {
      const email = `"${String(s.email).replace(/"/g, '""')}"`;
      const status = s.status;
      const date = new Date(s.createdAt).toISOString().split("T")[0];
      return `${email},${status},${date}`;
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to export subscribers" }, { status: 500 });
  }
}
