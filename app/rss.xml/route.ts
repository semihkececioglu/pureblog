import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { IPost } from "@/types";

export async function GET(): Promise<Response> {
  await connectDB();

  const posts = (await Post.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean()) as unknown as IPost[];

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>Latest posts from ${siteName}</description>
    <language>en</language>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description>${post.excerpt}</description>
      <pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog/${post.slug}</guid>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600",
    },
  });
}
