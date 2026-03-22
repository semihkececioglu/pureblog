import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";

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

  const posts = (await Post.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean()) as unknown as (IPost & { category: ICategory })[];

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "PureBlog";

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>Latest posts from ${escapeXml(siteName)}</description>
    <language>en</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post) => {
        const postUrl = `${siteUrl}/blog/${post.slug}`;
        const categoryName = post.category?.name ?? "";
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate>
      <guid isPermaLink="true">${postUrl}</guid>
      ${categoryName ? `<category>${escapeXml(categoryName)}</category>` : ""}
      ${post.coverImage ? `<media:content url="${escapeXml(post.coverImage)}" medium="image" />` : ""}
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
