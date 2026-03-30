"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ── NodeViews ─────────────────────────────────────────────────────────────────

function InlineMathView({
  node,
  updateAttributes,
  selected,
}: {
  node: { attrs: { latex: string } };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.latex);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [editing]);

  useEffect(() => {
    if (selected && !editing) setEditing(true);
  }, [selected, editing]);

  let rendered = "";
  try {
    rendered = katex.renderToString(node.attrs.latex || "\\square", {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    rendered = node.attrs.latex;
  }

  return (
    <NodeViewWrapper as="span" contentEditable={false} className="math-inline-wrapper">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            updateAttributes({ latex: draft });
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              updateAttributes({ latex: draft });
              setEditing(false);
            }
          }}
          className="font-mono text-sm border-b border-primary bg-transparent outline-none px-0.5 min-w-12 w-auto"
          style={{ width: `${Math.max(draft.length, 4)}ch` }}
          placeholder="\formula"
        />
      ) : (
        <span
          className="cursor-pointer hover:bg-muted/50 rounded px-0.5"
          title="Click to edit formula"
          onClick={() => setEditing(true)}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      )}
    </NodeViewWrapper>
  );
}

function BlockMathView({
  node,
  updateAttributes,
  selected,
}: {
  node: { attrs: { latex: string } };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.latex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => textareaRef.current?.focus(), 0);
  }, [editing]);

  useEffect(() => {
    if (selected && !editing) setEditing(true);
  }, [selected, editing]);

  let rendered = "";
  try {
    rendered = katex.renderToString(node.attrs.latex || "\\square", {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    rendered = `<span class="text-destructive text-sm">${node.attrs.latex}</span>`;
  }

  return (
    <NodeViewWrapper contentEditable={false} className="math-block-wrapper my-4">
      {editing ? (
        <div className="border border-border rounded p-3 bg-muted/20">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              updateAttributes({ latex: draft });
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                updateAttributes({ latex: draft });
                setEditing(false);
              }
              if (e.key === "Escape") {
                updateAttributes({ latex: draft });
                setEditing(false);
              }
            }}
            className="w-full font-mono text-sm bg-transparent outline-none resize-none min-h-12"
            placeholder="\LaTeX formula…"
            rows={3}
          />
          <p className="text-[10px] text-muted-foreground mt-1">Ctrl+Enter or Esc to confirm</p>
        </div>
      ) : (
        <div
          className={`flex justify-center cursor-pointer rounded p-2 ${selected ? "ring-2 ring-ring" : "hover:bg-muted/30"}`}
          title="Click to edit formula"
          onClick={() => setEditing(true)}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      )}
    </NodeViewWrapper>
  );
}

// ── Extensions ────────────────────────────────────────────────────────────────

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: (latex?: string) => ReturnType;
    };
    blockMath: {
      setBlockMath: (latex?: string) => ReturnType;
    };
  }
}

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: "x^2" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-latex]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-latex": HTMLAttributes.latex, class: "math-inline" }, {})];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(InlineMathView as any);
  },

  addCommands() {
    return {
      setInlineMath:
        (latex = "x^2") =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { latex } }),
    };
  },
});

export const BlockMath = Node.create({
  name: "blockMath",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: { default: "E = mc^2" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-latex-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-latex-block": HTMLAttributes.latex, class: "math-block" }, {})];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(BlockMathView as any);
  },

  addCommands() {
    return {
      setBlockMath:
        (latex = "E = mc^2") =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { latex } }),
    };
  },
});
