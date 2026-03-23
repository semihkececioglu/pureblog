"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-start gap-6">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
        500
      </span>
      <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground text-lg leading-relaxed">
        An unexpected error occurred. Try refreshing the page or come back later.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 font-mono text-sm border border-border px-4 py-2 hover:bg-muted transition-colors"
        >
          <RotateCcw width={13} height={13} />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft width={14} height={14} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
