import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-start gap-6">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
        404
      </span>
      <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground text-lg leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 font-mono text-sm hover:text-muted-foreground transition-colors"
      >
        <ArrowLeft width={14} height={14} />
        Back to home
      </Link>
    </div>
  );
}
