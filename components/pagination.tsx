import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function getPageNumbers(page: number, totalPages: number): (number | "...")[] {
  const delta = 2;
  const range: (number | "...")[] = [];
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);
  return range;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
          <ArrowLeft className="w-4 h-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center w-9 h-9 font-mono text-xs text-muted-foreground/40"
          >
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            className="flex items-center justify-center w-9 h-9 border border-foreground bg-foreground text-background font-mono text-xs"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-mono text-xs"
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
          <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
