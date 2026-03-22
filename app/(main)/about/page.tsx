import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "PureBlog is a minimal, fast, and distraction-free blogging platform built for writers who care about their content.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold tracking-tight mb-8">
        About
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          PureBlog is a minimal blogging platform built around a simple idea:
          writing should be the only thing that matters. No clutter, no noise —
          just your words and your readers.
        </p>
        <p>
          Most blogging tools come loaded with features you will never use.
          PureBlog takes the opposite approach. It strips everything down to the
          essentials — a clean editor, a distraction-free reading experience, and
          a straightforward admin panel that gets out of your way.
        </p>
        <p>
          Posts are organized by categories and tags, making it easy for readers
          to explore topics they care about. A built-in newsletter lets you reach
          your audience directly, without relying on social media algorithms.
          Comments are moderated, so the conversation stays on-topic and
          respectful.
        </p>
        <p>
          Under the hood, PureBlog is built with Next.js and MongoDB. Pages are
          fast by default, fully SEO-optimized, and render correctly on every
          device. Open Graph images, sitemaps, and structured data are handled
          automatically — no plugins, no configuration.
        </p>
        <p>
          If you have a question, a suggestion, or just want to say hello, the{" "}
          <a href="/contact">contact page</a> is always open.
        </p>
      </div>
    </div>
  );
}
