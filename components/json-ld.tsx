interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date;
  slug: string;
  coverImage?: string;
  author?: { name: string; slug: string };
}

interface PersonJsonLdProps {
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface WebsiteJsonLdProps {
  siteUrl: string;
  siteName: string;
}

export function ArticleJsonLd({
  title,
  description,
  publishedAt,
  updatedAt,
  slug,
  coverImage,
  author,
}: ArticleJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "PureBlog";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: new Date(updatedAt).toISOString(),
    author: author
      ? { "@type": "Person", name: author.name, url: `${siteUrl}/author/${author.slug}` }
      : { "@type": "Person", name: siteName },
    image: coverImage ?? `${siteUrl}/api/og?title=${encodeURIComponent(title)}`,
    url: `${siteUrl}/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd({ name, slug, bio, avatar, social }: PersonJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pureblog.vercel.app";

  const sameAs = [
    social?.twitter,
    social?.instagram,
    social?.linkedin,
    social?.github,
    social?.website,
  ].filter(Boolean);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${siteUrl}/author/${slug}`,
    ...(bio && { description: bio }),
    ...(avatar && { image: avatar }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd({ siteUrl, siteName }: WebsiteJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
