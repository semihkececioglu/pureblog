"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./editor-toolbar";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-96 p-4 focus:outline-none",
      },
    },
  });

  const wordCount = editor
    ? editor.storage.characterCount?.words?.() ??
      editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="border border-border">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end px-4 py-1.5 border-t border-border bg-muted/30">
        <span className="font-mono text-[10px] text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}
