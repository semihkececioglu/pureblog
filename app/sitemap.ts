import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { IPost, ICategory } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [posts, categories] = await Promise.all([
    Post.find({ status: "published" }).select("slug updatedAt").lean() as unknown as IPost[],
    Category.find().select("slug").lean() as unknown as ICategory[],
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
