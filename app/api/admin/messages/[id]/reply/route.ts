import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { body } = (await req.json()) as { body: string };
    if (!body?.trim()) {
      return NextResponse.json({ data: null, error: "Reply body is required" }, { status: 400 });
    }

    await connectDB();
    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ data: null, error: "Message not found" }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: message.email,
      subject: `Re: ${message.subject}`,
      text: body.trim(),
    });

    await Message.findByIdAndUpdate(id, { read: true });
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to send reply" }, { status: 500 });
  }
}
