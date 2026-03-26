export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Author from "@/models/Author";
import { IAuthor } from "@/types";
import { AuthorList } from "./author-list";

async function getAuthors() {
  await connectDB();
  const authors = await Author.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(authors)) as (IAuthor & { _id: string })[];
}

export default async function AdminAuthorsPage() {
  const authors = await getAuthors();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Authors</h1>
      <AuthorList initialAuthors={authors} />
    </div>
  );
}
