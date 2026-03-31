"use client";

import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  slug: string;
  title: string;
  bookmarkedAt: string;
}

const KEY = "pb_bookmarks";

function readStore(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setBookmarks(readStore());
    }
  }, [mounted]);

  const toggle = useCallback((slug: string, title: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.slug === slug);
      const next = exists
        ? prev.filter((b) => b.slug !== slug)
        : [...prev, { slug, title, bookmarkedAt: new Date().toISOString() }];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks],
  );

  return { bookmarks, toggle, isBookmarked };
}
