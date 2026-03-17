import { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { BlogFilters } from "@/components/blog-filters";
import { BlogPosts } from "@/components/blog-posts";
import { BlogPostsSkeleton } from "@/components/blog-posts-skeleton";
import { BlogPostCount } from "@/components/blog-post-count";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { ICategory } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "All posts, sorted by date.",
  path: "/blog",
});

async function getCategories() {
  await connectDB();
  const cats = await Category.find().sort({ name: 1 }).lean();
  return cats as unknown as ICategory[];
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: string;
    search?: string;
    view?: string;
  }>;
}) {
  const {
    page: pageParam,
    category = "",
    sort = "newest",
    search = "",
    view: viewParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const view: "grid" | "list" = viewParam === "list" ? "list" : "grid";
  const categories = await getCategories();
  const categoryName = category
    ? (categories.find((c) => c.slug === category)?.name ?? "")
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">
          Blog
        </h1>
        <Suspense fallback={<p className="text-muted-foreground text-sm">...</p>}>
          <BlogPostCount
            category={category}
            categoryName={categoryName}
            search={search}
          />
        </Suspense>
      </section>

      <BlogFilters
        categories={categories}
        currentCategory={category}
        currentSort={sort}
        currentView={view}
        currentSearch={search}
      />

      <Suspense fallback={<BlogPostsSkeleton view={view} />}>
        <BlogPosts
          page={page}
          category={category}
          sort={sort}
          search={search}
          view={view}
        />
      </Suspense>
    </div>
  );
}
