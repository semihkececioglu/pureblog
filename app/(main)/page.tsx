export const revalidate = 60;

import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Rss } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { NewsletterSection } from "@/components/newsletter-section";
import { ContactSection } from "@/components/contact-section";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Settings from "@/models/Settings";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { siteUrl } from "@/lib/metadata";
import { getCachedSettings } from "@/lib/cache";
import { WebsiteJsonLd } from "@/components/json-ld";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { TextAnimate } from "@/components/ui/text-animate";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  const name = settings.siteName || "PureBlog";
  const description = settings.metaDescription || "A modern blog.";
  const ogImage = settings.ogImage || `${siteUrl}/api/og?title=${encodeURIComponent(name)}`;

  return {
    title: { absolute: name },
    description,
    alternates: { canonical: siteUrl },
    openGraph: {
      title: name,
      description,
      url: siteUrl,
      type: "website",
      siteName: name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [ogImage],
    },
  };
}

// ─── data fetchers ────────────────────────────────────────────────────────────

async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return JSON.parse(JSON.stringify(settings ?? {}));
}

async function getFeaturedPosts() {
  await connectDB();
  const posts = await Post.find({ status: "published", featured: true })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

async function getGridPosts() {
  await connectDB();
  const posts = await Post.find({ status: "published", featured: false })
    .populate("category", "name slug")
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

// ─── skeletons ────────────────────────────────────────────────────────────────

function WelcomeSkeleton() {
  return (
    <section className="mb-8">
      <Skeleton className="h-10 md:h-12 w-2/3 mb-4" />
      <Skeleton className="h-5 w-full mb-1.5" />
      <Skeleton className="h-5 w-4/5 mb-6" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-36 mb-8" />
      <div className="border border-border">
        <Skeleton className="h-80 md:h-96 rounded-none" />
        <div className="p-6 md:p-8">
          <Skeleton className="h-5 w-20 rounded-full mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-4" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="px-6 md:px-8 py-3 border-t border-border flex items-center justify-between">
          <Skeleton className="w-7 h-7" />
          <div className="flex gap-1">
            <Skeleton className="h-1 w-4 rounded-full" />
            <Skeleton className="h-1 w-1.5 rounded-full" />
            <Skeleton className="h-1 w-1.5 rounded-full" />
          </div>
          <Skeleton className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="border border-border flex flex-col">
      <Skeleton className="h-56 rounded-none" />
      <div className="p-5 flex flex-col flex-1">
        <Skeleton className="h-5 w-5/6 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-4" />
        <Skeleton className="h-3 w-full mb-1.5" />
        <Skeleton className="h-3 w-4/5 mb-4" />
        <Skeleton className="h-3 w-24 mt-auto" />
      </div>
    </div>
  );
}

function RecentPostsSkeleton() {
  return (
    <div>
      <div className="relative h-2 overflow-hidden mt-0 -mx-4 border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>
      <Skeleton className="h-7 w-32 mt-8 mb-8" />
      <div className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_24px_1fr]">
          <PostCardSkeleton />
          <div className="relative h-6 md:h-auto overflow-hidden">
            <StripedPattern direction="right" className="text-border" />
          </div>
          <PostCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// ─── async sections ───────────────────────────────────────────────────────────

async function WelcomeSection() {
  const settings = await getSettings();

  return (
    <section className="mb-8">
      <TextAnimate animation="blurIn" as="h1" className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
        {settings.welcomeTitle || "Welcome to Pureblog."}
      </TextAnimate>
      <TextAnimate animation="blurIn" as="p" delay={0.15} className="text-muted-foreground text-lg mb-6">
        {settings.welcomeDescription || "Thoughts on technology, design, and everything in between."}
      </TextAnimate>
      <div className="flex items-center gap-1">
        {settings.socialLinks?.twitter && (
          <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="Twitter / X">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
        )}
        {settings.socialLinks?.github && (
          <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
          </a>
        )}
        {settings.socialLinks?.linkedin && (
          <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="LinkedIn">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </a>
        )}
        {settings.socialLinks?.instagram && (
          <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="Instagram">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
          </a>
        )}
        {settings.socialLinks?.youtube && (
          <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="YouTube">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </a>
        )}
        {settings.socialLinks?.facebook && (
          <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="Facebook">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        )}
        <a href="/rss.xml" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors" aria-label="RSS">
          <Rss className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}

async function FeaturedSection() {
  const [featuredPosts, gridPosts] = await Promise.all([
    getFeaturedPosts(),
    getGridPosts(),
  ]);

  const displayFeatured = featuredPosts.length > 0 ? featuredPosts : gridPosts.slice(0, 1);
  const otherPosts = featuredPosts.length > 0 ? gridPosts : gridPosts.slice(1);

  const rows: (IPost & { category: ICategory })[][] = [];
  for (let i = 0; i < otherPosts.length; i += 2) {
    rows.push(otherPosts.slice(i, i + 2));
  }

  if (featuredPosts.length === 0 && gridPosts.length === 0) {
    return <p className="text-muted-foreground">No posts yet.</p>;
  }

  return (
    <div className="flex flex-col">
      {displayFeatured.length > 0 && (
        <>
          <h2 className="font-serif text-2xl font-bold mb-8">
            {displayFeatured.length === 1 ? "Featured Post" : "Featured Posts"}
          </h2>
          <FeaturedCarousel posts={displayFeatured} />
        </>
      )}
      {rows.length > 0 && (
        <>
          <div className="relative h-2 overflow-hidden mt-0 -mx-4 border-y border-border">
            <StripedPattern direction="right" className="text-border" />
          </div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-8">Recent Posts</h2>
          {rows.map((row, rowIdx) => (
            <Fragment key={rowIdx}>
              {rowIdx > 0 && (
                <div className="relative h-6 overflow-hidden">
                  <StripedPattern direction="right" className="text-border" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_24px_1fr]">
                <PostCard post={row[0]} />
                {row[1] && (
                  <div className="relative h-6 md:h-auto overflow-hidden">
                    <StripedPattern direction="right" className="text-border" />
                  </div>
                )}
                {row[1] && <PostCard post={row[1]} />}
              </div>
            </Fragment>
          ))}
        </>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <WebsiteJsonLd siteUrl={siteUrl} siteName={settings.siteName || "PureBlog"} />

      <Suspense fallback={<WelcomeSkeleton />}>
        <WelcomeSection />
      </Suspense>

      <div className="relative h-2 overflow-hidden mb-8 -mx-4 border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>

      <section>
        <Suspense fallback={<><FeaturedSkeleton /><RecentPostsSkeleton /></>}>
          <FeaturedSection />
        </Suspense>
      </section>

      <div className="my-10 flex justify-center">
        <Link
          href="/blog"
          className="group font-serif text-sm font-medium border border-border px-6 py-2.5 hover:bg-accent transition-colors inline-flex items-center"
        >
          All Posts
          <span className="overflow-hidden w-0 group-hover:w-5 group-hover:ml-1.5 transition-all duration-200 flex items-center">
            <ArrowRight className="w-4 h-4 shrink-0" />
          </span>
        </Link>
      </div>

      <NewsletterSection />
      <ContactSection />
    </div>
  );
}
