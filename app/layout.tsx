import type { Metadata, Viewport } from "next";
import { Prata, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { getCachedSettings } from "@/lib/cache";
import "./globals.css";

const prata = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  return {
    title: settings.siteName || "PureBlog",
    description: settings.metaDescription || "A minimal blog",
    ...(settings.favicon && {
      icons: { icon: settings.favicon },
    }),
    alternates: {
      types: {
        "application/rss+xml": `${siteUrl}/feed.xml`,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${prata.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
