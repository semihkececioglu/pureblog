export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Author from "@/models/Author";
import { IAuthor } from "@/types";
import { AuthorList } from "./author-list";

async function getAuthors(q?: string) {
  await connectDB();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const authors = await Author.find(filter).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(authors)) as (IAuthor & { _id: string })[];
}

export default async function AdminAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const authors = await getAuthors(q);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">Authors</h1>
      <Suspense>
        <AuthorList initialAuthors={authors} />
      </Suspense>
    </div>
  );
}
