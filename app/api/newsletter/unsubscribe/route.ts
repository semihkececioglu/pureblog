import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    await connectDB();
    const subscriber = await Subscriber.findOneAndUpdate(
      { unsubscribeToken: token },
      { status: "unsubscribed" }
    );

    if (!subscriber) {
      return NextResponse.redirect(new URL("/?unsubscribe=invalid", req.url));
    }

    return NextResponse.redirect(new URL("/?unsubscribe=success", req.url));
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
