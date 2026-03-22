export const revalidate = 30;

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { Pagination } from "@/components/pagination";

const PER_PAGE = 6;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getCategoryWithPosts(slug: string, page: number) {
  await connectDB();

  const category = (await Category.findOne({ slug }).lean()) as unknown as ICategory | null;
  if (!category) return null;

  const skip = (page - 1) * PER_PAGE;
  const filter = { category: category._id, status: "published" };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(PER_PAGE)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    category,
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const category = (await Category.findOne({ slug }).lean()) as unknown as ICategory | null;
  if (!category) return {};
  const total = await Post.countDocuments({ category: category._id, status: "published" });
  const description =
    category.description ||
    `Explore ${total} ${total === 1 ? "post" : "posts"} in the ${category.name} category.`;
  return buildMetadata({ title: category.name, description, path: `/categories/${slug}` });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await getCategoryWithPosts(slug, page);
  if (!result) notFound();

  const { category, posts, total } = result;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Categories", url: `${siteUrl}/categories` },
          { name: category.name, url: `${siteUrl}/categories/${slug}` },
        ]}
      />
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
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
            {total} {total === 1 ? "post" : "posts"}
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

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/categories/${slug}?page=${p}`}
      />
    </div>
  );
}
