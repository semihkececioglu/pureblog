import Link from "next/link";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { ISettings } from "@/types";

async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return JSON.parse(JSON.stringify(settings ?? {})) as Partial<ISettings>;
}

export async function Footer() {
  const settings = await getSettings();
  const footerText =
    settings.footerText ||
    `© ${new Date().getFullYear()} PureBlog. All rights reserved.`;

  return (
    <footer className="relative mt-auto">
      <div className="relative h-2 overflow-hidden border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-28 md:pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{footerText}</p>
        <nav className="flex items-center gap-4">
          <Link
            href="/feed.xml"
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
