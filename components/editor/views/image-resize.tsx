"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { useRef, useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Download,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

type Align = "left" | "center" | "right" | "full";

interface ImageNodeAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: number | null;
  align?: Align;
}

interface ImageResizeViewProps {
  node: { attrs: ImageNodeAttrs };
  updateAttributes: (attrs: Partial<ImageNodeAttrs>) => void;
  deleteNode: () => void;
  selected: boolean;
}

const ALIGN_STYLES: Record<Align, string> = {
  left: "mr-auto ml-0",
  center: "mx-auto",
  right: "ml-auto mr-0",
  full: "w-full",
};

export function ImageResizeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: ImageResizeViewProps) {
  const [hovered, setHovered] = useState(false);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altDraft, setAltDraft] = useState(node.attrs.alt ?? "");
  const startX = useRef(0);
  const startWidth = useRef(0);
  const altInputRef = useRef<HTMLInputElement>(null);

  const align: Align = node.attrs.align ?? "center";
  const width = node.attrs.width;
  const showToolbar = selected || hovered;

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startWidth.current = width ?? 600;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current;
      const newWidth = Math.max(80, Math.min(1200, startWidth.current + delta));
      updateAttributes({ width: Math.round(newWidth) });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = node.attrs.src;
    a.download = node.attrs.alt || "image";
    a.target = "_blank";
    a.click();
  }

  function commitAlt() {
    updateAttributes({ alt: altDraft });
    setEditingAlt(false);
  }

  const wrapperAlign =
    align === "full"
      ? "w-full"
      : align === "left"
      ? "mr-auto ml-0"
      : align === "right"
      ? "ml-auto mr-0"
      : "mx-auto";

  return (
    <NodeViewWrapper
      contentEditable={false}
      className="my-4 flex flex-col"
    >
      {/* Image + toolbar container */}
      <div
        className={`relative inline-block max-w-full ${wrapperAlign}`}
        style={
          align !== "full" && width
            ? { width: `${width}px`, maxWidth: "100%" }
            : align === "full"
            ? { width: "100%" }
            : { maxWidth: "100%" }
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Floating toolbar */}
        {showToolbar && (
          <div
            contentEditable={false}
            className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-background border border-border rounded-md shadow-md px-1 py-0.5 whitespace-nowrap"
            onMouseEnter={() => setHovered(true)}
          >
            {/* Alignment */}
            {(["left", "center", "right", "full"] as Align[]).map((a) => {
              const Icon =
                a === "left"
                  ? AlignLeft
                  : a === "center"
                  ? AlignCenter
                  : a === "right"
                  ? AlignRight
                  : Maximize2;
              return (
                <button
                  key={a}
                  type="button"
                  title={`Align ${a}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    updateAttributes({ align: a });
                  }}
                  className={`p-1 rounded transition-colors ${
                    align === a
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}

            <div className="w-px h-4 bg-border mx-0.5" />

            {/* Edit alt text */}
            <button
              type="button"
              title="Edit alt text"
              onMouseDown={(e) => {
                e.preventDefault();
                setAltDraft(node.attrs.alt ?? "");
                setEditingAlt(true);
                setTimeout(() => altInputRef.current?.focus(), 0);
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Download */}
            <button
              type="button"
              title="Download image"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDownload();
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              type="button"
              title="Delete image"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Image */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? ""}
          draggable={false}
          className={`block w-full rounded transition-[outline] ${
            selected
              ? "outline outline-2 outline-offset-2 outline-ring"
              : "outline outline-2 outline-transparent"
          }`}
        />

        {/* Resize handles — right edge and bottom-right corner */}
        {selected && (
          <>
            {/* Bottom-right corner */}
            <div
              onMouseDown={startResize}
              className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-tl cursor-se-resize z-10"
              title="Drag to resize"
            />
            {/* Right edge */}
            <div
              onMouseDown={startResize}
              className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-10 bg-primary/70 rounded-l cursor-ew-resize z-10"
              title="Drag to resize"
            />
          </>
        )}
      </div>

      {/* Alt text editor */}
      {editingAlt ? (
        <div
          contentEditable={false}
          className={`flex items-center gap-1 mt-1 ${wrapperAlign}`}
          style={
            align !== "full" && width
              ? { width: `${width}px`, maxWidth: "100%" }
              : {}
          }
        >
          <input
            ref={altInputRef}
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAlt();
              if (e.key === "Escape") setEditingAlt(false);
            }}
            placeholder="Alt text / caption…"
            className="flex-1 text-sm text-center border-b border-primary bg-transparent outline-none px-1 text-muted-foreground"
          />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); commitAlt(); }}
            className="p-0.5 text-emerald-500 hover:text-emerald-600"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setEditingAlt(false); }}
            className="p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : node.attrs.alt ? (
        <p
          className={`text-sm text-center italic text-muted-foreground mt-1.5 ${wrapperAlign} cursor-pointer hover:text-foreground transition-colors`}
          style={
            align !== "full" && width
              ? { width: `${width}px`, maxWidth: "100%" }
              : {}
          }
          onClick={() => {
            setAltDraft(node.attrs.alt ?? "");
            setEditingAlt(true);
          }}
          title="Click to edit caption"
        >
          {node.attrs.alt}
        </p>
      ) : null}
    </NodeViewWrapper>
  );
}
