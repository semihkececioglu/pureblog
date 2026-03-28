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
import { CharacterCount } from "@tiptap/extension-character-count";
import Youtube from "@tiptap/extension-youtube";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./bubble-menu";
import { SlashCommand } from "./slash-command";
import { Callout } from "./callout-extension";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  maxWords?: number;
}

export function TiptapEditor({ content, onChange, maxWords }: TiptapEditorProps) {
  const [zenMode, setZenMode] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing, or type "/" for commands…',
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount,
      Youtube.configure({ controls: true, nocookie: true }),
      Superscript,
      Subscript,
      SlashCommand,
      Callout,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-96 p-4 focus:outline-none",
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

  const words = editor?.storage.characterCount?.words?.() ?? 0;
  const chars = editor?.storage.characterCount?.characters?.() ?? 0;
  const isOverLimit = maxWords ? words > maxWords : false;

  const editorShell = (
    <div className={zenMode ? "fixed inset-0 z-50 bg-background flex flex-col" : "border border-border"}>
      <EditorToolbar
        editor={editor}
        zenMode={zenMode}
        onToggleZen={() => setZenMode((v) => !v)}
        showFindReplace={showFindReplace}
        onToggleFindReplace={() => setShowFindReplace((v) => !v)}
      />

      <div className={zenMode ? "flex-1 overflow-auto" : ""}>
        <div className={zenMode ? "max-w-3xl mx-auto py-8 px-4" : ""}>
          {editor && <EditorBubbleMenu editor={editor} />}
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
            {chars} chars
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {words} {words === 1 ? "word" : "words"}
          </span>
        </div>
      </div>
    </div>
  );

  return editorShell;
}
