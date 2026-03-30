import type { Metadata } from "next";
import Script from "next/script";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VerticalLines } from "@/components/structural-lines";
import { siteUrl } from "@/lib/metadata";
import { ScrollBlur } from "@/components/scroll-blur";
import { CommandPaletteProvider } from "@/components/command-palette";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { getCachedSettings, getCachedCategoriesWithCount } from "@/lib/cache";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  const name = settings.siteName || "PureBlog";
  const description = settings.metaDescription || "A modern blog.";
  const ogImage = settings.ogImage || `${siteUrl}/api/og?title=${encodeURIComponent(name)}`;

  return {
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: {
      siteName: name,
      locale: "en_US",
      type: "website",
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
  const [settings, categories] = await Promise.all([
    getCachedSettings(),
    getCachedCategoriesWithCount(),
  ]);

  return (
    <CommandPaletteProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border"
      >
        Skip to main content
      </a>
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
      <Navbar
        siteName={settings.siteName || "Pureblog"}
        categories={categories.map((c) => ({ ...c, _id: String(c._id) }))}
      />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <ScrollBlur />
      <MobileBottomBar />
      <Footer />
    </CommandPaletteProvider>
  );
}
