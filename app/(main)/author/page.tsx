export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Author from "@/models/Author";
import Post from "@/models/Post";
import { IAuthor } from "@/types";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { buildMetadata, siteUrl } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Authors",
  description: "Meet the authors behind the posts.",
  path: "/author",
});

async function getAuthors() {
  await connectDB();
  const authors = (await Author.find().sort({ name: 1 }).lean()) as unknown as IAuthor[];

  const counts = await Promise.all(
    authors.map((a) => Post.countDocuments({ author: a._id, status: "published" })),
  );

  return authors.map((a, i) => ({ ...a, postCount: counts[i] }));
}

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Authors", url: `${siteUrl}/author` },
        ]}
      />

      <header className="mb-12">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
          People
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight">Authors</h1>
      </header>

      {authors.length === 0 ? (
        <p className="text-muted-foreground">No authors yet.</p>
      ) : (
        <div className="flex flex-col gap-px border-t border-border">
          {authors.map((author) => (
            <Link
              key={String(author._id)}
              href={`/author/${author.slug}`}
              className="group flex items-center gap-4 py-4 border-b border-border hover:bg-muted/30 transition-colors px-1"
            >
              {author.avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted shrink-0 flex items-center justify-center text-sm font-semibold text-muted-foreground border border-border">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:underline underline-offset-4">
                  {author.name}
                </p>
                {author.bio && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{author.bio}</p>
                )}
              </div>
              <span className="font-mono text-xs text-muted-foreground shrink-0">
                {author.postCount} {author.postCount === 1 ? "post" : "posts"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
