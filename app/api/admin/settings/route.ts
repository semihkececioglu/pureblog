import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  siteName: z.string().optional(),
  welcomeTitle: z.string().optional(),
  welcomeDescription: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
  footerText: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const settings = await Settings.findOne().lean();
    return NextResponse.json({ data: settings ?? {}, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();
    const settings = await Settings.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true });
    return NextResponse.json({ data: settings, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to save settings" }, { status: 500 });
  }
}
