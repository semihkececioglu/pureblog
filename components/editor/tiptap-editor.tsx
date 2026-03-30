"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCaption } from "./extensions/table-caption";
import { CharacterCount } from "@tiptap/extension-character-count";
import Youtube from "@tiptap/extension-youtube";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Typography from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontSize from "@tiptap/extension-font-size";
import FontFamily from "@tiptap/extension-font-family";
import { LineHeight } from "./extensions/line-height";
import { Indent } from "./extensions/indent";
import { Audio } from "./extensions/audio";
import { TwitterEmbed } from "./extensions/twitter";
import { CodeSandbox } from "./extensions/code-sandbox";
import { FileAttachment } from "./extensions/file-attachment";
import { common, createLowlight } from "lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./bubble-menu";
import { SlashCommand } from "./slash-command";
import { Callout } from "./callout-extension";
import { Details, DetailsSummary, DetailsContent } from "./extensions/details";
import { Vimeo } from "./extensions/vimeo";
import { Columns, Column } from "./extensions/columns";
import { InlineMath, BlockMath } from "./extensions/math";
import { CodeBlockView } from "./views/code-block-view";
import { ImageResizeView } from "./views/image-resize";
import { BlockHandle } from "./block-handle";
import { PostPreview, PostPreviewData } from "./post-preview";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  maxWords?: number;
  previewData?: PostPreviewData;
}

export function TiptapEditor({ content, onChange, maxWords, previewData }: TiptapEditorProps) {
  const [zenMode, setZenMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView as Parameters<typeof ReactNodeViewRenderer>[0]);
        },
      }),
      Image.configure({ allowBase64: true }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: null },
            align: { default: "center" },
          };
        },
        addNodeView() {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return ReactNodeViewRenderer(ImageResizeView as any);
        },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing, or type "/" for commands…',
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            density: {
              default: "normal",
              parseHTML: (el) => el.getAttribute("data-density") ?? "normal",
              renderHTML: ({ density }) =>
                density ? { "data-density": density } : {},
            },
          };
        },
      }),
      TableRow,
      // Extend TableCell & TableHeader with background color attribute
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (el) => el.getAttribute("data-bg") ?? null,
              renderHTML: ({ backgroundColor }) =>
                backgroundColor
                  ? { "data-bg": backgroundColor, style: `background-color: ${backgroundColor}` }
                  : {},
            },
          };
        },
      }),
      TableHeader.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (el) => el.getAttribute("data-bg") ?? null,
              renderHTML: ({ backgroundColor }) =>
                backgroundColor
                  ? { "data-bg": backgroundColor, style: `background-color: ${backgroundColor}` }
                  : {},
            },
          };
        },
      }),
      TableCaption,
      CharacterCount,
      Youtube.configure({ controls: true, nocookie: true }),
      Superscript,
      Subscript,
      Typography,
      TextStyle,
      Color,
      SlashCommand,
      Callout,
      Details,
      DetailsSummary,
      DetailsContent,
      Vimeo,
      Columns,
      Column,
      InlineMath,
      BlockMath,
      FontSize,
      FontFamily,
      LineHeight,
      Indent,
      Audio,
      TwitterEmbed,
      CodeSandbox,
      FileAttachment,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-96 p-4 focus:outline-none",
      },
      transformPastedHTML(html) {
        // Strip MS Word / Google Docs junk
        return html
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, "")
          .replace(/<w:[^>]+>[\s\S]*?<\/w:[^>]+>/gi, "")
          .replace(/<m:[^>]+>[\s\S]*?<\/m:[^>]+>/gi, "")
          .replace(/\s*(mso-[^;"]+|panose-[^;"]+)[^;]*;?/gi, "")
          .replace(/\sstyle="[^"]*"/gi, (match) => {
            // Keep only basic styles
            const keep = match.match(/(?:font-weight|font-style|text-decoration)[^;"]*;?/g);
            return keep ? ` style="${keep.join("")}"` : "";
          });
      },
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setShowFindReplace((v) => !v);
      }
      if (e.key === "Escape") {
        if (zenMode) setZenMode(false);
        if (showFindReplace) setShowFindReplace(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zenMode, showFindReplace]);

  // Sync table density attribute to live DOM (TableView NodeView doesn't re-apply custom attrs)
  useEffect(() => {
    if (!editor) return;
    const syncDensity = () => {
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== "table") return true;
        const dom = editor.view.nodeDOM(pos) as HTMLElement | null;
        if (!dom) return true;
        const tableEl = dom.tagName === "TABLE" ? dom : dom.querySelector("table");
        if (tableEl) tableEl.setAttribute("data-density", (node.attrs.density as string) ?? "normal");
        return false;
      });
    };
    editor.on("transaction", syncDensity);
    syncDensity();
    return () => { editor.off("transaction", syncDensity); };
  }, [editor]);

  // Typewriter mode: keep cursor vertically centered
  useEffect(() => {
    if (!editor || !typewriterMode) return;
    const scrollCursor = () => {
      const { view } = editor;
      const { from } = view.state.selection;
      const coords = view.coordsAtPos(from);
      const scrollEl = view.dom.closest(".tiptap-scroll") as HTMLElement | null;
      const target = scrollEl ?? (zenMode ? view.dom.closest(".overflow-auto") as HTMLElement | null : null);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const relY = coords.top - rect.top + target.scrollTop;
      target.scrollTo({ top: relY - target.clientHeight / 2, behavior: "smooth" });
    };
    editor.on("selectionUpdate", scrollCursor);
    editor.on("update", scrollCursor);
    return () => {
      editor.off("selectionUpdate", scrollCursor);
      editor.off("update", scrollCursor);
    };
  }, [editor, typewriterMode, zenMode]);

  const words = editor?.storage.characterCount?.words?.() ?? 0;
  const chars = editor?.storage.characterCount?.characters?.() ?? 0;
  const isOverLimit = maxWords ? words > maxWords : false;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const mergedPreviewData: PostPreviewData = {
    readingTime,
    ...previewData,
  };

  return (
    <>
      {/* Preview overlay */}
      {showPreview && (
        <PostPreview
          content={editor?.getHTML() ?? content}
          data={mergedPreviewData}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className={zenMode ? "fixed inset-0 z-50 bg-background flex flex-col" : "border border-border"}>
        <EditorToolbar
          editor={editor}
          zenMode={zenMode}
          onToggleZen={() => setZenMode((v) => !v)}
          typewriterMode={typewriterMode}
          onToggleTypewriter={() => setTypewriterMode((v) => !v)}
          showFindReplace={showFindReplace}
          onToggleFindReplace={() => setShowFindReplace((v) => !v)}
          onTogglePreview={() => setShowPreview((v) => !v)}
        />

        <div className={zenMode ? "flex-1 overflow-auto tiptap-scroll" : ""}>
          <div className={zenMode ? "max-w-3xl mx-auto py-8 px-4" : ""}>
            {editor && <EditorBubbleMenu editor={editor} />}
            {editor && <BlockHandle editor={editor} />}
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/30">
          <div>
            {maxWords && (
              <span
                className={`font-mono text-[10px] ${
                  isOverLimit ? "text-destructive font-semibold" : "text-muted-foreground"
                }`}
              >
                {words} / {maxWords} words
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              ~{readingTime} min read
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {chars} chars
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {words} {words === 1 ? "word" : "words"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
