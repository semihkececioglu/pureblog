"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, LayoutGroup } from "motion/react";
import { IPost, ICategory } from "@/types";
import { CornerMark } from "@/components/structural-lines";
import { calcReadingTime } from "@/lib/reading-time";
import { useView } from "@/components/view-context";
import { cn } from "@/lib/utils";

function formatDate(date?: Date | string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const layoutTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 38,
  mass: 0.8,
};

interface PostsViewProps {
  posts: (IPost & { category: ICategory })[];
}

export function PostsView({ posts }: PostsViewProps) {
  const { view } = useView();

  return (
    <LayoutGroup>
      <motion.div
        layout
        transition={layoutTransition}
        className={cn(
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-6"
            : "flex flex-col gap-4",
        )}
      >
        {posts.map((post) => (
          <AnimatedPostCard key={String(post._id)} post={post} view={view} />
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

function AnimatedPostCard({
  post,
  view,
}: {
  post: IPost & { category: ICategory };
  view: "grid" | "list";
}) {
  return (
    <motion.div
      layout
      transition={layoutTransition}
      className={cn(
        "group relative border border-border hover:bg-muted/40 transition-colors duration-200 cursor-pointer",
        view === "list" ? "flex flex-row" : "flex flex-col",
      )}
    >
      <CornerMark position="top-left" />
      <CornerMark position="top-right" />
      <CornerMark position="bottom-left" />
      <CornerMark position="bottom-right" />

      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
        tabIndex={-1}
      />

      {/* Image — layout-animated between full-width top and thumbnail left */}
      <motion.div
        layout
        transition={layoutTransition}
        className={cn(
          "relative shrink-0 overflow-hidden",
          view === "list" ? "w-36 self-stretch" : "h-56 w-full",
        )}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={view === "list" ? "144px" : "(max-width: 768px) 100vw, 50vw"}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span
              className={cn(
                "font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40 select-none",
                view === "list" && "[writing-mode:vertical-rl]",
              )}
            >
              no image
            </span>
          </div>
        )}
      </motion.div>

      {/* Content — layout-animated */}
      <motion.div
        layout
        transition={layoutTransition}
        className={cn(
          "flex flex-col min-w-0",
          view === "list" ? "p-4 flex-1 justify-between" : "p-5 flex-1",
        )}
      >
        <div>
          <h2
            className={cn(
              "font-serif font-bold leading-snug",
              view === "list"
                ? "text-base line-clamp-2 mb-1"
                : "text-lg mb-2 flex-1",
            )}
          >
            {post.title}
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center justify-between",
            view === "list" ? "mt-3" : "mt-4",
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
            {formatDate(post.publishedAt) && (
              <>
                <span>{formatDate(post.publishedAt)}</span>
                <span className="text-border">·</span>
              </>
            )}
            <span>{calcReadingTime(post.content)} min read</span>
          </div>
          <ArrowRight
            className={cn(
              "text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-45",
              view === "list" ? "w-3.5 h-3.5" : "w-4 h-4",
            )}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
