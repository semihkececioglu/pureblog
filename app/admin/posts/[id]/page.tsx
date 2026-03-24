export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import PostSeries from "@/models/PostSeries";
import { ICategory, IPostSeries } from "@/types";
import { PostForm } from "../post-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  await connectDB();
  const [rawPost, categories, seriesList, existingTags] = await Promise.all([
    Post.findById(id).lean(),
    Category.find().sort({ name: 1 }).lean(),
    PostSeries.find().sort({ name: 1 }).lean(),
    Post.distinct("tags"),
  ]);

  const post = rawPost as Record<string, unknown> | null;

  return {
    post: post ? (JSON.parse(JSON.stringify(post)) as Record<string, unknown>) : null,
    categories: JSON.parse(JSON.stringify(categories)) as (ICategory & { _id: string })[],
    seriesList: JSON.parse(JSON.stringify(seriesList)) as (IPostSeries & { _id: string })[],
    existingTags: existingTags as string[],
  };
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const { post, categories, seriesList, existingTags } = await getData(id);

  if (!post) notFound();

  const initialData = {
    _id: String(post._id),
    title: post.title as string,
    slug: post.slug as string,
    excerpt: post.excerpt as string,
    content: post.content as string,
    category: String(post.category),
    tags: post.tags as string[],
    coverImage: post.coverImage as string | undefined,
    scheduledAt: post.scheduledAt
      ? new Date(post.scheduledAt as unknown as string).toISOString().slice(0, 16)
      : undefined,
    series: post.series ? String(post.series) : undefined,
    seriesOrder: post.seriesOrder as number | undefined,
    featured: post.featured as boolean | undefined,
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Edit Post
      </h1>
      <PostForm categories={categories} seriesList={seriesList} existingTags={existingTags} initialData={initialData} />
    </div>
  );
}
