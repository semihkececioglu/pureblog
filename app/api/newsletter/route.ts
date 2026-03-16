import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await connectDB();

    await Subscriber.create({ name: "", email, status: "active" });

    return NextResponse.json({
      data: null,
      error: null,
      message: "Subscribed successfully.",
    });
  } catch (err: unknown) {
    // MongoDB duplicate key error
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { data: null, error: "Already subscribed." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to subscribe." },
      { status: 500 }
    );
  }
}
