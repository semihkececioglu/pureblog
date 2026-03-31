"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IPost, ICategory } from "@/types";
import { CardWithCorners } from "@/components/structural-lines";
import { calcReadingTime } from "@/lib/reading-time";
import { FeaturedPostCard } from "@/components/post-card";

function formatDate(date?: Date | string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const SWIPE_THRESHOLD = 50;
const AUTO_ADVANCE_MS = 5000;

interface Props {
  posts: (IPost & { category: ICategory })[];
}

export function FeaturedCarousel({ posts }: Props) {
  if (posts.length === 1) {
    return <FeaturedPostCard post={posts[0]} />;
  }
  return <Carousel posts={posts} />;
}

function Carousel({ posts }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduce = useReducedMotion();
  const dragStartX = useRef<number | null>(null);

  const go = useCallback(
    (index: number) => setCurrent((index + posts.length) % posts.length),
    [posts.length],
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  const transition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: shouldReduce ? 0 : 0.38,
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/*
        CardWithCorners is OUTSIDE the overflow-hidden track.
        Corner marks are on this element, so they never get clipped.
      */}
      <CardWithCorners className="hover:bg-muted/40 transition-colors duration-200">
        {/* Slide track — clips only horizontal slide movement */}
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => {
            dragStartX.current = e.clientX;
            setPaused(true);
          }}
          onPointerUp={(e) => {
            if (dragStartX.current === null) return;
            const delta = e.clientX - dragStartX.current;
            dragStartX.current = null;
            if (delta < -SWIPE_THRESHOLD) next();
            else if (delta > SWIPE_THRESHOLD) prev();
            setPaused(false);
          }}
          onPointerLeave={() => { dragStartX.current = null; }}
          onPointerCancel={() => { dragStartX.current = null; }}
        >
          {/* CSS grid stack — all slides share one cell, no AnimatePresence */}
          <div style={{ display: "grid" }}>
            {posts.map((post, i) => (
              <motion.div
                key={post._id as unknown as string}
                aria-hidden={i !== current}
                className="relative"
                style={{ gridRow: 1, gridColumn: 1 }}
                initial={{ x: `${i * 100}%` }}
                animate={{ x: `${(i - current) * 100}%` }}
                transition={transition}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="absolute inset-0 z-10"
                  aria-label={post.title}
                  tabIndex={i === current ? 0 : -1}
                  draggable={false}
                />

                {post.coverImage ? (
                  <div className="relative h-80 md:h-96 overflow-hidden pointer-events-none">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 768px"
                      draggable={false}
                      priority={i === 0}
                    />
                  </div>
                ) : (
                  <div className="h-80 md:h-96 bg-muted flex items-center justify-center pointer-events-none">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest opacity-40">
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
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                    {formatDate(post.publishedAt) && (
                      <>
                        <span>{formatDate(post.publishedAt)}</span>
                        <span className="text-border">·</span>
                      </>
                    )}
                    <span>{calcReadingTime(post.content)} min read</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nav bar — sibling of track, inside CardWithCorners, never clipped */}
        <div className="px-6 md:px-8 py-3 border-t border-border flex items-center justify-between">
          <button
            onClick={prev}
            aria-label="Previous featured post"
            className="w-7 h-7 flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to featured post ${i + 1}`}
                className="h-6 flex items-center justify-center px-0.5"
              >
                <motion.div
                  animate={{
                    width: i === current ? 18 : 5,
                    backgroundColor:
                      i === current ? "var(--foreground)" : "var(--border)",
                  }}
                  transition={{ type: "spring", stiffness: 600, damping: 35 }}
                  className="h-1 rounded-full"
                />
              </button>
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next featured post"
            className="w-7 h-7 flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardWithCorners>
    </div>
  );
}
