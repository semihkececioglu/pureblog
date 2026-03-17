"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

interface TopCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

function CategoriesMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<TopCategory[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = pathname.startsWith("/categories");

  useEffect(() => {
    fetch("/api/categories/top")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`inline-flex items-center gap-1 text-sm transition-colors px-2.5 py-1.5 rounded-sm hover:bg-muted/60 leading-none ${
          isActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-expanded={open}
      >
        Categories
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 w-[420px]"
          >
            <div className="border border-border bg-background shadow-lg overflow-hidden rounded-sm">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Top Categories
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {categories.length} shown
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2">
                {categories.map((cat, i) => (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className={`group relative flex flex-col gap-1.5 p-4 hover:bg-muted/50 transition-colors border-border ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug group-hover:text-foreground transition-colors">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 mt-0.5">
                        {cat.postCount} posts
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/20">
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Browse all categories
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center text-sm transition-colors px-2.5 py-1.5 rounded-sm hover:bg-muted/60 leading-none ${
        isActive
          ? "text-foreground font-medium hover:text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

const staticLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const allMobileLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setTimeout(() => setOpen(false), 0);
    }
  }, [pathname]);

  // ⌘K / Ctrl+K → go to search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <header className="relative">
      <nav className="relative max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          Pureblog
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {staticLinks.map((link) => {
            const isActive =
              link.href === "/blog"
                ? pathname.startsWith("/blog")
                : pathname === link.href;
            return (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} isActive={isActive} />
              </li>
            );
          })}
          <li>
            <CategoriesMenu />
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1">
            <Link href="/search" title="Search (Ctrl+K)">
              <Button variant="ghost" size="icon" aria-label="Search" className="relative group">
                <Search width={16} height={16} />
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-popover border border-border text-[10px] text-muted-foreground px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm pointer-events-none z-50">
                  <kbd className="font-mono">⌘K</kbd>
                </span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="md:hidden"
              onClick={() => setOpen((prev) => !prev)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    <X width={16} height={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    <Menu width={16} height={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <ul className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-1">
              {allMobileLinks.map((link) => {
                const isActive =
                  link.href === "/blog"
                    ? pathname.startsWith("/blog")
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center text-sm px-2.5 py-2 rounded-sm transition-colors hover:bg-muted/60 ${
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-2 overflow-hidden border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>
    </header>
  );
}
