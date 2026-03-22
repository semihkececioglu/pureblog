import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { sendCustomNewsletter } from "@/lib/mailer";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { subject, body } = (await req.json()) as { subject: string; body: string };
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ data: null, error: "Subject and body are required" }, { status: 400 });
    }

    await connectDB();
    await sendCustomNewsletter(subject.trim(), body.trim());

    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to send emails" }, { status: 500 });
  }
}
