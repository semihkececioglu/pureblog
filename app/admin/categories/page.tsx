import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { ICategory } from "@/types";
import { CategoryList } from "./category-list";

async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories as unknown as (ICategory & { _id: string })[];
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Categories
      </h1>
      <CategoryList initialCategories={categories} />
    </div>
  );
}
