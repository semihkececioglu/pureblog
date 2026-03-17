import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";

interface BlogPostCountProps {
  category: string;
  categoryName: string;
  search: string;
}

export async function BlogPostCount({
  category,
  categoryName,
  search,
}: BlogPostCountProps) {
  await connectDB();

  const filter: Record<string, unknown> = { status: "published" };

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) filter.category = (cat as { _id: unknown })._id;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Post.countDocuments(filter);

  return (
    <p className="text-muted-foreground">
      {total} {total === 1 ? "post" : "posts"}
      {categoryName ? ` in "${categoryName}"` : ""}
      {search ? ` matching "${search}"` : ""}
    </p>
  );
}
