import Link from "next/link";
import Image from "next/image";
import { IPost, ICategory } from "@/types";
import { CardWithCorners } from "@/components/structural-lines";

interface PostCardProps {
  post: IPost & { category: ICategory };
}

function CoverImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }
  return (
    <div
      className={`overflow-hidden bg-muted flex items-center justify-center ${className}`}
    >
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40 select-none">
        no image
      </span>
    </div>
  );
}

export function FeaturedPostCard({ post }: PostCardProps) {
  return (
    <CardWithCorners className="group cursor-pointer hover:bg-muted/20 transition-colors duration-200">
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
        tabIndex={-1}
      />
      <CoverImage src={post.coverImage} alt={post.title} className="h-64 md:h-80" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/categories/${post.category.slug}`}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest relative z-20"
          >
            {post.category.name}
          </Link>
          <span className="text-border">—</span>
          <span className="font-mono text-xs text-muted-foreground">
            {post.readingTime} min read
          </span>
          <span className="font-mono text-xs bg-foreground text-background px-2 py-0.5 ml-auto">
            FEATURED
          </span>
        </div>

        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
          {post.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors relative z-20"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </CardWithCorners>
  );
}

export function PostCard({ post }: PostCardProps) {
  return (
    <CardWithCorners className="group cursor-pointer hover:bg-muted/20 transition-colors duration-200 flex flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
        tabIndex={-1}
      />
      <CoverImage src={post.coverImage} alt={post.title} className="h-44" />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/categories/${post.category.slug}`}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest relative z-20"
          >
            {post.category.name}
          </Link>
          <span className="text-border">—</span>
          <span className="font-mono text-xs text-muted-foreground">
            {post.readingTime} min read
          </span>
        </div>

        <h2 className="font-serif text-xl font-bold mb-2 leading-snug">
          {post.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors relative z-20"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </CardWithCorners>
  );
}
