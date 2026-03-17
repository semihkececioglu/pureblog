import Link from "next/link";
import { StripedPattern } from "@/components/magicui/striped-pattern";

export function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="relative h-2 overflow-hidden border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PureBlog. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/rss.xml"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            RSS
          </Link>
          <Link
            href="/sitemap.xml"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sitemap
          </Link>
        </nav>
      </div>
    </footer>
  );
}
