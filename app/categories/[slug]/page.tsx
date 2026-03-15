import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
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
      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Category
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </header>

      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts in this category yet.
          </p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>
    </div>
  );
}
