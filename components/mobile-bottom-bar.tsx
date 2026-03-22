"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { useCommandPalette } from "@/components/command-palette";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-background border border-border shadow-xl overflow-hidden">
              {navLinks.map((link, i) => {
                const isActive =
                  link.href === "/blog"
                    ? pathname.startsWith("/blog")
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50 ${
                      i < navLinks.length - 1 ? "border-b border-border" : ""
                    } ${isActive ? "bg-muted/30" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      } transition-colors`}
                    >
                      {link.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom pill bar */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-full px-2 py-2">
          {/* Search */}
          <button
            aria-label="Search"
            onClick={openPalette}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono text-muted-foreground/70">Search...</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border" />

          {/* Hamburger / Close */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <X className="w-4 h-4" />
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
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </>
  );
}
