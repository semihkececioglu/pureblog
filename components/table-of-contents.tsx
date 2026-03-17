"use client";

import { useEffect, useRef, useState } from "react";
import { TocHeading } from "@/lib/toc";
import { List, ChevronDown } from "lucide-react";

interface Props {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  return (
    <nav className="mb-8 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <List className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Table of Contents
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="px-4 py-3 flex flex-col gap-1 border-t border-border">
          {headings.map(({ id, text, level }) => (
            <li key={id} className={level === 3 ? "pl-4" : ""}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-sm transition-colors hover:text-foreground ${
                  activeId === id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
