"use client";

import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface Props {
  slug: string;
  title: string;
}

export function BookmarkButton({ slug, title }: Props) {
  const { toggle, isBookmarked } = useBookmarks();
  const saved = isBookmarked(slug);

  function handleClick() {
    toggle(slug, title);
    if (saved) {
      toast("Bookmark removed", { description: title });
    } else {
      toast.success("Bookmarked", { description: title });
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={handleClick}
          aria-label={saved ? "Remove bookmark" : "Bookmark this post"}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
        >
          {saved ? (
            <BookmarkFilledIcon className="w-3.5 h-3.5 text-primary" />
          ) : (
            <BookmarkOutlineIcon className="w-3.5 h-3.5" />
          )}
        </TooltipTrigger>
        <TooltipContent>{saved ? "Remove bookmark" : "Bookmark"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
