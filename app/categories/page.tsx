import Link from "next/link";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { ICategory } from "@/types";

async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories as unknown as ICategory[];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold tracking-tight mb-12">
        Categories
      </h1>
      <div className="flex flex-col gap-4">
        {categories.length === 0 ? (
          <p className="text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <Link
              key={String(category._id)}
              href={`/categories/${category.slug}`}
              className="group border border-border p-6 hover:border-foreground transition-colors"
            >
              <h2 className="font-serif text-xl font-bold mb-1 group-hover:underline underline-offset-4">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
