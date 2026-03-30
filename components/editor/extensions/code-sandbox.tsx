"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Code2, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeSandbox: {
      setCodeSandbox: (url: string) => ReturnType;
    };
  }
}

type Provider = "codesandbox" | "codepen" | "stackblitz" | "unknown";

function detectProvider(url: string): Provider {
  if (url.includes("codesandbox.io")) return "codesandbox";
  if (url.includes("codepen.io")) return "codepen";
  if (url.includes("stackblitz.com")) return "stackblitz";
  return "unknown";
}

function toEmbedUrl(url: string): string | null {
  try {
    const provider = detectProvider(url);
    if (provider === "codesandbox") {
      // https://codesandbox.io/s/abc → https://codesandbox.io/embed/abc
      return url.replace(/codesandbox\.io\/(s|p)\//, "codesandbox.io/embed/").split("?")[0];
    }
    if (provider === "codepen") {
      // https://codepen.io/user/pen/abc → https://codepen.io/user/embed/abc
      const m = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/);
      if (m) return `https://codepen.io/${m[1]}/embed/${m[2]}?default-tab=result`;
    }
    if (provider === "stackblitz") {
      // https://stackblitz.com/edit/abc → https://stackblitz.com/edit/abc?embed=1
      const base = url.split("?")[0];
      return `${base}?embed=1&view=preview`;
    }
  } catch { /* */ }
  return null;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  codesandbox: "CodeSandbox",
  codepen: "CodePen",
  stackblitz: "StackBlitz",
  unknown: "Code Embed",
};

// ── NodeView ──────────────────────────────────────────────────────────────────

function CodeSandboxView({
  node,
  selected,
}: {
  node: { attrs: { url: string } };
  selected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const provider = detectProvider(node.attrs.url);
  const embedUrl = toEmbedUrl(node.attrs.url);

  return (
    <NodeViewWrapper contentEditable={false} className="my-4">
      <div
        className={`rounded-xl border overflow-hidden transition-[outline] ${
          selected ? "outline outline-2 outline-offset-2 outline-ring" : "outline outline-2 outline-transparent"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
          <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground flex-1 truncate">
            {PROVIDER_LABELS[provider]}
          </span>
          <button
            type="button"
            title={expanded ? "Collapse" : "Expand"}
            onMouseDown={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <a
            href={node.attrs.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={(e) => e.preventDefault()}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embed or fallback */}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={PROVIDER_LABELS[provider]}
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            allow="encrypted-media"
            className="w-full border-0 block bg-white"
            style={{ height: expanded ? "600px" : "320px", transition: "height 0.2s" }}
            loading="lazy"
          />
        ) : (
          <div className="p-4 flex items-center gap-3">
            <Code2 className="w-5 h-5 text-muted-foreground" />
            <a
              href={node.attrs.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate"
            >
              {node.attrs.url}
            </a>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const CodeSandbox = Node.create({
  name: "codeSandbox",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-codesandbox]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-codesandbox": HTMLAttributes.url })];
  },

  addCommands() {
    return {
      setCodeSandbox:
        (url: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { url } }),
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNodeView() {
    return ReactNodeViewRenderer(CodeSandboxView as any);
  },
});
