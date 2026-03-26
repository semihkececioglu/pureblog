export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import PostSeries from "@/models/PostSeries";
import Post from "@/models/Post";
import Author from "@/models/Author";
import { IAuthor, ICategory, IPostSeries } from "@/types";
import { PostForm } from "../post-form";

async function getData() {
  await connectDB();
  const [categories, seriesList, existingTags, authors] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    PostSeries.find().sort({ name: 1 }).lean(),
    Post.distinct("tags"),
    Author.find().sort({ name: 1 }).lean(),
  ]);
  return {
    categories: JSON.parse(JSON.stringify(categories)) as (ICategory & { _id: string })[],
    seriesList: JSON.parse(JSON.stringify(seriesList)) as (IPostSeries & { _id: string })[],
    existingTags: existingTags as string[],
    authors: JSON.parse(JSON.stringify(authors)) as (IAuthor & { _id: string })[],
  };
}

export default async function NewPostPage() {
  const { categories, seriesList, existingTags, authors } = await getData();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        New Post
      </h1>
      <PostForm categories={categories} seriesList={seriesList} existingTags={existingTags} authors={authors} />
    </div>
  );
}
