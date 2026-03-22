import Link from "next/link";
import Image from "next/image";
import { IPost } from "@/types";

interface Props {
  posts: IPost[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RelatedPosts({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Related Posts
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={String(post._id)}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-2 border border-border hover:bg-muted/40 transition-colors"
          >
            {post.coverImage ? (
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-muted/60" />
            )}
            <div className="p-3 flex flex-col gap-1">
              <span className="text-sm font-medium leading-snug group-hover:underline underline-offset-4 line-clamp-2">
                {post.title}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {post.readingTime ?? 0} min · {formatDate(post.publishedAt!)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
