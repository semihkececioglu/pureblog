"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { Play, Pause, Volume2, Music } from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (attrs: { src: string; title?: string }) => ReturnType;
    };
  }
}

// ── NodeView ──────────────────────────────────────────────────────────────────

function AudioView({ node, selected }: { node: { attrs: { src: string; title?: string } }; selected: boolean }) {
  return (
    <NodeViewWrapper contentEditable={false} className="my-4">
      <div
        className={`flex flex-col gap-1.5 rounded-lg border p-3 bg-muted/30 transition-[outline] ${
          selected ? "outline outline-2 outline-offset-2 outline-ring" : "outline outline-2 outline-transparent"
        }`}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Music className="w-4 h-4 shrink-0" />
          <span className="truncate font-medium">{node.attrs.title || "Audio"}</span>
        </div>
        <audio
          controls
          src={node.attrs.src}
          className="w-full h-9 rounded"
          style={{ accentColor: "hsl(var(--primary))" }}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </NodeViewWrapper>
  );
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-audio]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-audio": "" }),
      ["audio", mergeAttributes({ controls: true, src: HTMLAttributes.src })],
    ];
  },

  addCommands() {
    return {
      setAudio:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNodeView() {
    return ReactNodeViewRenderer(AudioView as any);
  },
});
