"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, ArrowRight } from "lucide-react";

interface SearchPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  category?: { name: string; slug: string };
}

// ─── Context ───────────────────────────────────────────────────────────────

interface CommandPaletteCtx {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteCtx>({
  open: false,
  openPalette: () => {},
  closePalette: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

// ─── Modal ─────────────────────────────────────────────────────────────────

function CommandPaletteModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveIndex(-1);

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/blog/${slug}`);
    },
    [onClose, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        navigate(results[activeIndex].slug);
      } else if (query.trim()) {
        onClose();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const showFooter = query.trim().length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative w-full max-w-xl bg-background border border-border shadow-xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:flex items-center text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {loading && (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            Searching...
          </div>
        )}

        {!loading && results.length === 0 && query.trim().length >= 2 && (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul>
            {results.map((post, i) => (
              <li key={post._id}>
                <button
                  className={`w-full text-left flex flex-col gap-0.5 px-4 py-3 transition-colors border-b border-border last:border-b-0 ${
                    i === activeIndex
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => navigate(post.slug)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium leading-snug line-clamp-1">
                      {post.title}
                    </span>
                    {post.category && (
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 shrink-0">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {showFooter && (
          <div className="border-t border-border bg-muted/20">
            <button
              className="group w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
              onClick={() => {
                onClose();
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                View all results for &ldquo;{query}&rdquo;
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette }}>
      {children}
      <AnimatePresence>
        {open && <CommandPaletteModal onClose={closePalette} />}
      </AnimatePresence>
    </CommandPaletteContext.Provider>
  );
}
