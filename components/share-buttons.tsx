"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Upload,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { BookmarkButton } from "@/components/bookmark-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface Props {
  title: string;
  url: string;
  slug: string;
  excerpt?: string;
  prevSlug?: string;
  nextSlug?: string;
}

const iconProps = { className: "w-3.5 h-3.5", strokeWidth: 2.5 };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function ShareButtons({ title, url, slug, excerpt, prevSlug, nextSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setShareOpen(false);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function nativeShare() {
    navigator.share?.({ title, text: excerpt, url }).catch(() => {});
    setShareOpen(false);
  }

  useEffect(() => {
    if (isMobile) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobile]);

  const shareOptionClass =
    "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left";

  const shareItems = (
    <>
      <button onClick={copyLink} className={shareOptionClass}>
        {copied ? (
          <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />
        ) : (
          <Copy className="w-4 h-4" strokeWidth={2.5} />
        )}
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShareOpen(false)}
        className={shareOptionClass}
      >
        <XIcon />
        Share on X
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShareOpen(false)}
        className={shareOptionClass}
      >
        <LinkedinIcon />
        Share on LinkedIn
      </a>
      {"share" in navigator && (
        <button onClick={nativeShare} className={shareOptionClass}>
          <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
          More options
        </button>
      )}
    </>
  );

  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto px-4 h-11 flex items-center gap-1 border-x border-b border-border">
        {/* Left */}
        <Link
          href="/blog"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-auto"
        >
          <ArrowLeft {...iconProps} />
          Blog
        </Link>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Bookmark button */}
          <BookmarkButton slug={slug} title={title} />

          {/* Share button */}
          {isMobile ? (
            <>
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Share"
                className="flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check {...iconProps} className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Upload {...iconProps} />
                )}
              </button>
              <Sheet open={shareOpen} onOpenChange={setShareOpen}>
                <SheetContent side="bottom" className="pb-safe-area-inset-bottom" showCloseButton={false}>
                  <SheetHeader className="pb-2">
                    <SheetTitle>Share</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col border-t border-border">
                    {shareItems}
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => setShareOpen(false)}
                      className="w-full py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShareOpen((p) => !p)}
                aria-label="Share"
                className="flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check {...iconProps} className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Upload {...iconProps} />
                )}
              </button>

              {shareOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 border border-border bg-background shadow-lg rounded-lg overflow-hidden z-50 p-1">
                  <button onClick={copyLink} className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} /> : <Copy {...iconProps} />}
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)} className="flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                    <XIcon />
                    Share on X
                  </a>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)} className="flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                    <LinkedinIcon />
                    Share on LinkedIn
                  </a>
                  {"share" in navigator && (
                    <button onClick={nativeShare} className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                      <MoreHorizontal {...iconProps} />
                      More options
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Prev / Next */}
          {prevSlug ? (
            <Link href={`/blog/${prevSlug}`} aria-label="Previous post" className="flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-muted/70 transition-colors cursor-pointer">
              <ArrowLeft {...iconProps} />
            </Link>
          ) : (
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-muted opacity-30 cursor-not-allowed">
              <ArrowLeft {...iconProps} />
            </span>
          )}
          {nextSlug ? (
            <Link href={`/blog/${nextSlug}`} aria-label="Next post" className="flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-muted/70 transition-colors cursor-pointer">
              <ArrowRight {...iconProps} />
            </Link>
          ) : (
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-muted opacity-30 cursor-not-allowed">
              <ArrowRight {...iconProps} />
            </span>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="relative h-2 overflow-hidden border-x border-b border-border">
          <StripedPattern direction="right" className="text-border" />
        </div>
      </div>
    </div>
  );
}
