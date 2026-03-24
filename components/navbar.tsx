"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, ArrowRight, Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCommandPalette } from "@/components/command-palette";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

function CategoriesMenu({ categories }: { categories: TopCategory[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = pathname.startsWith("/categories");

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

export function Navbar({ siteName = "Pureblog", categories = [] }: { siteName?: string; categories?: TopCategory[] }) {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  // ⌘K / Ctrl+K → open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openPalette]);

  return (
    <header className="relative">
      <nav className="relative max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          {siteName}
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
            <CategoriesMenu categories={categories} />
          </li>
        </ul>

        {/* Actions */}
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {/* Search — desktop only */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Search"
                    className="hidden md:flex"
                    onClick={openPalette}
                  />
                }
              >
                <Search width={16} height={16} />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-1.5">
                <span>Search</span>
                <kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1 py-0.5 leading-none">⌘</kbd>
                <kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1 py-0.5 leading-none">K</kbd>
              </TooltipContent>
            </Tooltip>

            {/* Bookmarks — always visible */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/bookmarks"
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                    aria-label="Bookmarks"
                  />
                }
              >
                <Bookmark width={16} height={16} />
              </TooltipTrigger>
              <TooltipContent side="bottom">Bookmarks</TooltipContent>
            </Tooltip>

            {/* Theme toggle — always visible */}
            <ThemeToggle />
          </div>
        </TooltipProvider>
      </nav>

      <div className="relative h-2 overflow-hidden border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>
    </header>
  );
}
