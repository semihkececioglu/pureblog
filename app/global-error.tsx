"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-start justify-center max-w-2xl mx-auto px-4 gap-6">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          500
        </span>
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-lg">
          A critical error occurred. Please refresh the page.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 font-mono text-sm border border-border px-4 py-2 hover:bg-muted transition-colors"
        >
          <RotateCcw width={13} height={13} />
          Try again
        </button>
      </body>
    </html>
  );
}
