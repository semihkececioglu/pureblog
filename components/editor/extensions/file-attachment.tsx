"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import {
  FileText, FileImage, FileVideo, FileAudio,
  FileCode, FileArchive, File, Download, Trash2,
} from "lucide-react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (attrs: {
        src: string;
        filename: string;
        filesize?: number | null;
        filetype?: string | null;
      }) => ReturnType;
    };
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ filetype }: { filetype?: string | null }) {
  const t = filetype?.toLowerCase() ?? "";
  if (t.startsWith("image/")) return <FileImage className="w-5 h-5" />;
  if (t.startsWith("video/")) return <FileVideo className="w-5 h-5" />;
  if (t.startsWith("audio/")) return <FileAudio className="w-5 h-5" />;
  if (t.includes("pdf") || t.includes("word") || t.includes("text")) return <FileText className="w-5 h-5" />;
  if (t.includes("zip") || t.includes("tar") || t.includes("rar")) return <FileArchive className="w-5 h-5" />;
  if (t.includes("json") || t.includes("javascript") || t.includes("html") || t.includes("css")) return <FileCode className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
}

// ── NodeView ──────────────────────────────────────────────────────────────────

function FileAttachmentView({
  node,
  deleteNode,
  selected,
}: {
  node: { attrs: { src: string; filename: string; filesize?: number | null; filetype?: string | null } };
  deleteNode: () => void;
  selected: boolean;
}) {
  const { src, filename, filesize, filetype } = node.attrs;

  return (
    <NodeViewWrapper contentEditable={false} className="my-3">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 bg-muted/20 group transition-[outline] ${
          selected ? "outline outline-2 outline-offset-2 outline-ring" : "outline outline-2 outline-transparent"
        }`}
      >
        <span className="text-muted-foreground shrink-0">
          <FileIcon filetype={filetype} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{filename}</p>
          {filesize != null && (
            <p className="text-xs text-muted-foreground">{formatBytes(filesize)}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={src}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      filename: { default: "file" },
      filesize: { default: null },
      filetype: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file-attachment]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({
        "data-file-attachment": "",
        "data-src": HTMLAttributes.src,
        "data-filename": HTMLAttributes.filename,
      }),
      ["a", { href: HTMLAttributes.src, download: HTMLAttributes.filename }, HTMLAttributes.filename],
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView as any);
  },
});
