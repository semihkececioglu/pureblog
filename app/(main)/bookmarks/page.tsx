"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import type { Bookmark as BookmarkType } from "@/hooks/use-bookmarks";

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("pb_bookmarks") ?? "[]") as BookmarkType[];
      setBookmarks(stored.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()));
    } catch {
      setBookmarks([]);
    }
    setLoaded(true);
  }, []);

  function remove(slug: string) {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.slug !== slug);
      localStorage.setItem("pb_bookmarks", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookmarkFilledIcon className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-3xl font-bold tracking-tight">Bookmarks</h1>
        </div>
        {loaded && (
          <p className="font-mono text-xs text-muted-foreground">
            {bookmarks.length} saved post{bookmarks.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {!loaded ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium hover:underline underline-offset-4"
          >
            Browse posts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {bookmarks.map((b) => (
            <div
              key={b.slug}
              className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <BookmarkFilledIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <Link
                    href={`/blog/${b.slug}`}
                    className="text-sm font-medium hover:underline underline-offset-4 line-clamp-2"
                  >
                    {b.title}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {new Date(b.bookmarkedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => remove(b.slug)}
                aria-label="Remove bookmark"
                className="shrink-0 font-mono text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
