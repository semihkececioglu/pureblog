import Link from "next/link";
import { BookOpen } from "lucide-react";

interface SeriesPost {
  slug: string;
  title: string;
  seriesOrder: number;
}

interface Props {
  seriesName: string;
  posts: SeriesPost[];
  currentSlug: string;
}

export function SeriesNavigation({ seriesName, posts, currentSlug }: Props) {
  const sorted = [...posts].sort((a, b) => a.seriesOrder - b.seriesOrder);

  return (
    <div className="border border-border p-5 my-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Series
        </span>
      </div>
      <p className="font-serif text-lg font-bold mb-3">{seriesName}</p>
      <ol className="flex flex-col gap-1.5">
        {sorted.map((post) => (
          <li key={post.slug} className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-muted-foreground w-5 shrink-0">
              {post.seriesOrder}.
            </span>
            {post.slug === currentSlug ? (
              <span className="text-sm font-medium">{post.title}</span>
            ) : (
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
