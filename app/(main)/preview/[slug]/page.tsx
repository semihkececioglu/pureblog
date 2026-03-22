import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { addHeadingIds, extractHeadings } from "@/lib/toc";
import { TableOfContents } from "@/components/table-of-contents";
import { calcReadingTime } from "@/lib/reading-time";
import sanitizeHtml from "sanitize-html";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  await connectDB();

  const post = (await Post.findOne({ previewToken: token })
    .populate("category", "name slug")
    .lean()) as unknown as (IPost & { category: ICategory }) | null;

  if (!post) notFound();

  const rawContent = addHeadingIds(post.content);
  const contentWithIds = sanitizeHtml(rawContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "figure", "figcaption",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "pre", "code", "s", "u", "mark",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id", "class"],
      "a": ["href", "target", "rel"],
      "img": ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
  const headings = extractHeadings(contentWithIds);
  const readingTime = calcReadingTime(post.content);

  return (
    <>
      <div className="sticky top-0 z-50 bg-yellow-400 text-yellow-900 text-center text-sm font-medium py-2 px-4 flex items-center justify-center gap-2">
        <span>⚠ Preview Mode</span>
        <span className="font-mono text-xs opacity-70">— This post is not published yet</span>
        <Link
          href="/admin/posts"
          className="ml-4 underline underline-offset-2 hover:opacity-70"
        >
          Back to Admin
        </Link>
      </div>

      <article className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              {post.status}
            </span>
            {post.category && <span>{post.category.name}</span>}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-snug">{post.excerpt}</p>
        </header>

        <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-border mb-8">
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-r border-border">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Reading Time
            </span>
            <span className="text-sm font-medium">{readingTime} min</span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Last Updated
            </span>
            <span className="text-sm font-medium">{formatDate(post.updatedAt)}</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-xl border border-border">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {headings.length > 0 && <TableOfContents headings={headings} />}

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-3 py-1.5 rounded-full bg-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
