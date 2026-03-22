import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";
import { rateLimit, getIP } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getIP(req);
  const rl = rateLimit(`newsletter:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { data: null, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await connectDB();

    const unsubscribeToken = crypto.randomUUID();
    await Subscriber.create({ email, status: "active", unsubscribeToken });

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
