import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { PostForm } from "../post-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  await connectDB();
  const post = await Post.findById(id).lean();
  return post;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  const initialData = {
    _id: String((post as { _id: unknown })._id),
    title: (post as { title: string }).title,
    slug: (post as { slug: string }).slug,
    excerpt: (post as { excerpt: string }).excerpt,
    content: (post as { content: string }).content,
    category: String((post as { category: unknown }).category),
    tags: (post as { tags: string[] }).tags,
    coverImage: (post as { coverImage?: string }).coverImage,
    status: (post as { status: "draft" | "published" }).status,
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Edit Post
      </h1>
      <PostForm initialData={initialData} />
    </div>
  );
}
