export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { getCachedCategoriesWithCount } from "@/lib/cache";
import { CardWithCorners } from "@/components/structural-lines";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Browse posts by topic.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getCachedCategoriesWithCount();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[
        { name: "Home", url: siteUrl },
        { name: "Categories", url: `${siteUrl}/categories` },
      ]} />
      <section className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          Categories
        </h1>
        <p className="text-muted-foreground">Browse posts by topic.</p>
      </section>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CardWithCorners key={String(category._id)}>
              <Link
                href={`/categories/${category.slug}`}
                className="group flex flex-col gap-2 p-6 hover:bg-muted/40 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-serif text-xl font-bold leading-snug group-hover:underline underline-offset-4">
                    {category.name}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 mt-1">
                    {category.postCount} posts
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                )}
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-1 inline-flex items-center gap-1">
                  Browse
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </CardWithCorners>
          ))}
        </div>
      )}
    </div>
  );
}
