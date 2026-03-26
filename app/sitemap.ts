import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Author from "@/models/Author";
import PostSeries from "@/models/PostSeries";
import { IPost, ICategory, IAuthor, IPostSeries } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [posts, categories, authors, tags, seriesList] = await Promise.all([
    Post.find({ status: "published" }).select("slug updatedAt").lean() as unknown as IPost[],
    Category.find().select("slug").lean() as unknown as ICategory[],
    Author.find().select("slug updatedAt").lean() as unknown as IAuthor[],
    Post.distinct("tags", { status: "published" }) as unknown as Promise<string[]>,
    PostSeries.find().select("slug updatedAt").lean() as unknown as IPostSeries[],
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/series`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/author`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
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

  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${siteUrl}/author/${author.slug}`,
    lastModified: author.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${siteUrl}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagsIndexRoute: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/tags`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  const seriesRoutes: MetadataRoute.Sitemap = seriesList.map((s) => ({
    url: `${siteUrl}/series/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...authorRoutes, ...seriesRoutes, ...tagsIndexRoute, ...tagRoutes];
}
