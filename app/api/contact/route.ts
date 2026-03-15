import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  content: z.string().min(10),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, email, subject, content } = schema.parse(body);

    await connectDB();

    await Message.create({ name, email, subject, content, read: false });

    return NextResponse.json({
      data: null,
      error: null,
      message: "Message sent successfully.",
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to send message" },
      { status: 500 },
    );
  }
}
