"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { Twitter, ExternalLink } from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    twitter: {
      setTweet: (url: string) => ReturnType;
    };
  }
}

function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

// ── NodeView ──────────────────────────────────────────────────────────────────

function TwitterView({
  node,
  selected,
}: {
  node: { attrs: { url: string } };
  selected: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tweetId = extractTweetId(node.attrs.url);

  useEffect(() => {
    if (!containerRef.current || !tweetId) return;
    const el = containerRef.current;
    el.innerHTML = "";

    const load = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const twttr = (window as any).twttr;
      if (twttr?.widgets) {
        twttr.widgets.createTweet(tweetId, el, {
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          conversation: "none",
          dnt: true,
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).twttr) {
      load();
    } else {
      const existing = document.getElementById("twitter-wjs");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "twitter-wjs";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.onload = load;
        document.body.appendChild(script);
      } else {
        existing.addEventListener("load", load);
      }
    }
  }, [tweetId]);

  return (
    <NodeViewWrapper contentEditable={false} className="my-4 flex justify-center">
      <div
        className={`w-full max-w-lg rounded-xl border bg-muted/20 transition-[outline] ${
          selected ? "outline outline-2 outline-offset-2 outline-ring" : "outline outline-2 outline-transparent"
        }`}
      >
        {/* Tweet embed target */}
        <div ref={containerRef} className="min-h-[80px] flex items-center justify-center p-4" />

        {/* Fallback card (visible until widget loads) */}
        {!tweetId ? (
          <div className="p-4 flex items-center gap-3">
            <Twitter className="w-5 h-5 text-sky-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">X / Twitter</p>
              <a
                href={node.attrs.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline truncate block"
              >
                {node.attrs.url}
              </a>
            </div>
            <a href={node.attrs.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const TwitterEmbed = Node.create({
  name: "twitterEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-tweet]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-tweet": HTMLAttributes.url })];
  },

  addCommands() {
    return {
      setTweet:
        (url: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { url } }),
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNodeView() {
    return ReactNodeViewRenderer(TwitterView as any);
  },
});
