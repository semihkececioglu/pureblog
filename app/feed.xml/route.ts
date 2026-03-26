import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Author";
import { getCachedSettings } from "@/lib/cache";
import { IAuthor, IPost } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  await connectDB();

  const [posts, settings] = await Promise.all([
    Post.find({ status: "published" })
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(20)
      .select("title slug excerpt publishedAt updatedAt author coverImage")
      .lean() as unknown as Promise<(IPost & { author?: IAuthor })[]>,
    getCachedSettings(),
  ]);

  const siteName = escapeXml(settings.siteName || "PureBlog");
  const siteDescription = escapeXml(settings.metaDescription || "A minimal blog");

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt!).toUTCString();
      const title = escapeXml(post.title);
      const description = escapeXml(post.excerpt);
      const authorName = post.author ? escapeXml(post.author.name) : siteName;

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <author>${authorName}</author>
      <pubDate>${pubDate}</pubDate>
      ${post.coverImage ? `<enclosure url="${escapeXml(post.coverImage)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
