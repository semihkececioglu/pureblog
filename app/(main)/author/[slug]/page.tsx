export const revalidate = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Globe, Github, Twitter, Instagram, Linkedin, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import Author from "@/models/Author";
import Post from "@/models/Post";
import "@/models/Category";
import { IAuthor, IPost, ICategory } from "@/types";
import { PostCard } from "@/components/post-card";
import { BreadcrumbJsonLd, PersonJsonLd } from "@/components/json-ld";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { Pagination } from "@/components/pagination";

export async function generateStaticParams() {
  await connectDB();
  const authors = (await Author.find().select("slug").lean()) as unknown as Pick<IAuthor, "slug">[];
  return authors.map((a) => ({ slug: a.slug }));
}

const PER_PAGE = 9;

function toAbsoluteUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const socialConfig = [
  { key: "twitter" as const, Icon: Twitter, label: "Twitter / X" },
  { key: "instagram" as const, Icon: Instagram, label: "Instagram" },
  { key: "linkedin" as const, Icon: Linkedin, label: "LinkedIn" },
  { key: "github" as const, Icon: Github, label: "GitHub" },
  { key: "website" as const, Icon: Globe, label: "Website" },
];

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getAuthorWithPosts(slug: string, page: number) {
  await connectDB();

  const author = (await Author.findOne({ slug }).lean()) as unknown as IAuthor | null;
  if (!author) return null;

  const skip = (page - 1) * PER_PAGE;
  const filter = { author: author._id, status: "published" };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(PER_PAGE)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    author,
    posts: posts as unknown as (IPost & { category: ICategory })[],
    total,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const author = (await Author.findOne({ slug }).lean()) as unknown as IAuthor | null;
  if (!author) return {};

  const description =
    author.bio ||
    `Read all posts written by ${author.name}.`;

  return {
    ...buildMetadata({
      title: author.name,
      description,
      path: `/author/${slug}`,
      image: author.avatar,
    }),
    openGraph: {
      title: author.name,
      description,
      url: `${siteUrl}/author/${slug}`,
      type: "profile",
      ...(author.avatar && {
        images: [{ url: author.avatar, width: 400, height: 400, alt: author.name }],
      }),
    },
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await getAuthorWithPosts(slug, page);
  if (!result) notFound();

  const { author, posts, total } = result;
  const totalPages = Math.ceil(total / PER_PAGE);
  const socialLinks = socialConfig.filter(({ key }) => !!author.social?.[key]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PersonJsonLd
        name={author.name}
        slug={author.slug}
        bio={author.bio}
        avatar={author.avatar}
        social={author.social}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Authors", url: `${siteUrl}/author` },
          { name: author.name, url: `${siteUrl}/author/${slug}` },
        ]}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
        Home
      </Link>

      {/* Author header */}
      <header className="mb-12">
        <div className="flex items-start gap-5 mb-6">
          {author.avatar ? (
            <div className="w-20 h-20 rounded-full shrink-0 border border-border overflow-hidden">
              <Image
                src={author.avatar}
                alt={author.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted shrink-0 flex items-center justify-center text-2xl font-bold text-muted-foreground border border-border">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Author
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              {author.name}
            </h1>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {socialLinks.map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={toAbsoluteUrl(author.social?.[key] ?? "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {author.bio && (
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{author.bio}</p>
        )}

        <div className="mt-4 font-mono text-xs text-muted-foreground">
          {total} {total === 1 ? "post" : "posts"}
        </div>
      </header>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground col-span-2">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={String(post._id)} post={post} />)
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/author/${slug}?page=${p}`}
      />
    </div>
  );
}
