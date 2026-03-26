"use client";

import Link from "next/link";
import Image from "next/image";
import { IAuthor } from "@/types";
import { Globe, Github, Twitter, Instagram, Linkedin } from "lucide-react";

interface AuthorCardProps {
  author: IAuthor & { _id: string };
}

const socialIcons = {
  twitter: { Icon: Twitter, label: "Twitter / X" },
  instagram: { Icon: Instagram, label: "Instagram" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  github: { Icon: Github, label: "GitHub" },
  website: { Icon: Globe, label: "Website" },
} as const;

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const socialEntries = (
    Object.entries(socialIcons) as [keyof typeof socialIcons, (typeof socialIcons)[keyof typeof socialIcons]][]
  ).filter(([key]) => !!author.social?.[key]);

  return (
    <Link
      href={`/author/${author.slug}`}
      className="flex gap-4 p-5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
    >
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover shrink-0 border border-border"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-muted shrink-0 flex items-center justify-center text-lg font-semibold text-muted-foreground border border-border">
          {author.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Author
        </span>
        <span className="font-semibold text-sm leading-snug group-hover:underline underline-offset-4">
          {author.name}
        </span>
        {author.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>
        )}
        {socialEntries.length > 0 && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {socialEntries.map(([key, { Icon, label }]) => (
              <a
                key={key}
                href={toAbsoluteUrl(author.social?.[key] ?? "")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                onClick={(e) => e.preventDefault() || e.stopPropagation() || window.open(toAbsoluteUrl(author.social?.[key] ?? ""), "_blank")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1 -m-1 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
