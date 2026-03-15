import Link from "next/link";

import { IPost, ICategory } from "@/types";
import { CornerMark } from "@/components/structural-lines";
import { AlignVerticalDistributeCenter } from "lucide-react";

interface PostCardProps {
  post: IPost & { category: ICategory };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="relative border border-border p-6 group">
      <CornerMark />
      <span
        className="corner-mark"
        style={{ top: 0, right: 0, left: "auto" }}
        aria-hidden="true"
      />
      <span
        className="corner-mark"
        style={{ bottom: 0, top: "auto", left: 0 }}
        aria-hidden="true"
      />
      <span
        className="corner-mark"
        style={{ bottom: 0, top: "auto", right: 0, left: "auto" }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-3 mb-3">
        <Link
          href={`/categories/${post.category.slug}`}
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          {post.category.name}
        </Link>
        <span className="text-border">-</span>
        <span className="font-mono text-xs text-muted-foreground">
          {post.readingTime} min read
        </span>
      </div>

      <h2 className="font-serif text-xl font-bold mb-2 group-hover:underline underline-offset-4">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>

      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {post.excerpt}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
