import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { IPost, ICategory } from "@/types";
import { CardWithCorners } from "@/components/structural-lines";
import { calcReadingTime } from "@/lib/reading-time";

interface PostCardProps {
  post: IPost & { category: ICategory };
  view?: "grid" | "list";
}

function formatDate(date?: Date | string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CoverImage({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <div className="relative h-40 overflow-hidden">
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
    <div className="h-40 bg-muted flex items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40 select-none">
        no image
      </span>
    </div>
  );
}

export function FeaturedPostCard({ post }: PostCardProps) {
  return (
    <CardWithCorners className="group cursor-pointer hover:bg-muted/40 transition-colors duration-200">
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
        tabIndex={-1}
      />
      {post.coverImage ? (
        <div className="relative h-64 md:h-72 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : (
        <div className="h-64 md:h-72 bg-muted flex items-center justify-center">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40 select-none">
            no image
          </span>
        </div>
      )}
      <div className="p-6 md:p-8">
        <span className="font-mono text-xs bg-foreground text-background px-2.5 py-0.5 rounded-full">
          FEATURED
        </span>

        <h2 className="font-serif text-2xl md:text-3xl font-bold mt-4 mb-3 leading-tight">
          {post.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
            {formatDate(post.publishedAt) && (
              <>
                <span>{formatDate(post.publishedAt)}</span>
                <span className="text-border">·</span>
              </>
            )}
            <span>{calcReadingTime(post.content)} min read</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-45" />
        </div>
      </div>
    </CardWithCorners>
  );
}

export function PostCard({ post, view = "grid" }: PostCardProps) {
  if (view === "list") {
    return (
      <CardWithCorners className="group cursor-pointer hover:bg-muted/40 transition-colors duration-200 flex flex-row">
        <Link
          href={`/blog/${post.slug}`}
          className="absolute inset-0 z-10"
          aria-label={post.title}
          tabIndex={-1}
        />
        {post.coverImage ? (
          <div className="relative w-36 shrink-0 self-stretch overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="144px"
            />
          </div>
        ) : (
          <div className="w-36 shrink-0 self-stretch bg-muted flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40 select-none [writing-mode:vertical-rl]">
              no image
            </span>
          </div>
        )}
        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h2 className="font-serif text-base font-bold leading-snug line-clamp-2 mb-1">
              {post.title}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
              {formatDate(post.publishedAt) && (
                <>
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="text-border">·</span>
                </>
              )}
              <span>{calcReadingTime(post.content)} min read</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-45" />
          </div>
        </div>
      </CardWithCorners>
    );
  }

  return (
    <CardWithCorners className="group cursor-pointer hover:bg-muted/40 transition-colors duration-200 flex flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
        tabIndex={-1}
      />
      <CoverImage src={post.coverImage} alt={post.title} />
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-serif text-lg font-bold mb-2 leading-snug flex-1">
          {post.title}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
            {formatDate(post.publishedAt) && (
              <>
                <span>{formatDate(post.publishedAt)}</span>
                <span className="text-border">·</span>
              </>
            )}
            <span>{calcReadingTime(post.content)} min read</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-45" />
        </div>
      </div>
    </CardWithCorners>
  );
}
