import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "PureBlog";

export function buildMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = image ?? `${siteUrl}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export { siteUrl, siteName };
