import Link from "next/link";
import { IPost, ICategory } from "@/types";
import { CardWithCorners } from "@/components/structural-lines";

interface PostCardProps {
  post: IPost & { category: ICategory };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <CardWithCorners className="p-6 group">
      <div className="flex items-center gap-3 mb-3">
        <Link
          href={`/categories/${post.category.slug}`}
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          {post.category.name}
        </Link>
        <span className="text-border">—</span>
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
    </CardWithCorners>
  );
}
