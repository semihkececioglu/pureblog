import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryWithPosts(slug: string) {
  await connectDB();

  const category = (await Category.findOne({
    slug,
  }).lean()) as unknown as ICategory | null;
  if (!category) return null;

  const posts = (await Post.find({
    category: category._id,
    status: "published",
  })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .lean()) as unknown as (IPost & { category: ICategory })[];

  return { category, posts };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getCategoryWithPosts(slug);

  if (!result) notFound();

  const { category, posts } = result;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1 inline-block">
          ←
        </span>
        Categories
      </Link>

      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Category
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-3">
          {category.name}
        </h1>
        <div className="flex items-center gap-3">
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground col-span-2">
            No posts in this category yet.
          </p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>
    </div>
  );
}
