import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<ImageResponse> {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "PureBlog";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "PureBlog";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAFAF8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            color: "#737373",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {siteName}
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? "48px" : "64px",
            fontWeight: "bold",
            color: "#1A1A1A",
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "#1A1A1A",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
