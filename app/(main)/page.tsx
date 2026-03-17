import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Rss } from "lucide-react";
import { PostCard, FeaturedPostCard } from "@/components/post-card";
import { NewsletterSection } from "@/components/newsletter-section";
import { ContactSection } from "@/components/contact-section";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Category";
import { IPost, ICategory } from "@/types";
import { buildMetadata, siteUrl, siteName } from "@/lib/metadata";
import { WebsiteJsonLd } from "@/components/json-ld";
import { StripedPattern } from "@/components/magicui/striped-pattern";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description: "Thoughts on technology, design, and everything in between.",
});

async function getPosts() {
  await connectDB();
  const posts = await Post.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ featured: -1, publishedAt: -1 })
    .limit(7)
    .lean();
  return posts as unknown as (IPost & { category: ICategory })[];
}

export default async function HomePage() {
  const posts = await getPosts();
  const featuredPost = posts.find((p) => p.featured) ?? posts[0] ?? null;
  const otherPosts = posts.filter((p) => p !== featuredPost);

  const rows: (IPost & { category: ICategory })[][] = [];
  for (let i = 0; i < otherPosts.length; i += 2) {
    rows.push(otherPosts.slice(i, i + 2));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <WebsiteJsonLd siteUrl={siteUrl} siteName={siteName} />

      <section className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to Pureblog.
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Thoughts on technology, design, and everything in between.
        </p>
        <div className="flex items-center gap-1">
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors"
            aria-label="Twitter / X"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <a
            href="/rss.xml"
            className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded transition-colors"
            aria-label="RSS"
          >
            <Rss className="w-5 h-5" />
          </a>
        </div>
      </section>

      <div className="relative h-2 overflow-hidden mb-8 -mx-4 border-y border-border">
        <StripedPattern direction="right" className="text-border" />
      </div>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-8">Recent Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="flex flex-col">
            {featuredPost && <FeaturedPostCard post={featuredPost} />}
            {rows.length > 0 && (
              <>
                <div className="relative h-6 overflow-hidden">
                  <StripedPattern direction="right" className="text-border" />
                </div>
                {rows.map((row, rowIdx) => (
                  <Fragment key={rowIdx}>
                    {rowIdx > 0 && (
                      <div className="relative h-6 overflow-hidden">
                        <StripedPattern
                          direction="right"
                          className="text-border"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_24px_1fr]">
                      <PostCard post={row[0]} />
                      {row[1] && (
                        <div className="relative h-6 md:h-auto overflow-hidden">
                          <StripedPattern
                            direction="right"
                            className="text-border"
                          />
                        </div>
                      )}
                      {row[1] && <PostCard post={row[1]} />}
                    </div>
                  </Fragment>
                ))}
              </>
            )}
          </div>
        )}
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
