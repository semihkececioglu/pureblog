export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Script from "next/script";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VerticalLines } from "@/components/structural-lines";
import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { ISettings } from "@/types";
import { siteUrl, siteName as defaultSiteName } from "@/lib/metadata";
import { ScrollBlur } from "@/components/scroll-blur";
import { CommandPaletteProvider } from "@/components/command-palette";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";

async function getSettings() {
  noStore();
  await connectDB();
  const settings = await Settings.findOne().lean();
  return JSON.parse(JSON.stringify(settings ?? {})) as Partial<ISettings>;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings.siteName || defaultSiteName;
  const description = settings.metaDescription || "A modern blog.";
  const ogImage = settings.ogImage || `${siteUrl}/api/og?title=${encodeURIComponent(name)}`;

  return {
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: {
      siteName: name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CommandPaletteProvider>
      {settings.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}');`}
          </Script>
        </>
      )}
      <VerticalLines />
      <Navbar siteName={settings.siteName || "Pureblog"} />
      <main className="flex-1">
        {children}
      </main>
      <ScrollBlur />
      <MobileBottomBar />
      <Footer />
    </CommandPaletteProvider>
  );
}
