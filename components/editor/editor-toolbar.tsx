"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link,
  Image,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  function addImage(): void {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  function setLink(): void {
    const url = window.prompt("URL");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
  }

  const tools = [
    [
      {
        icon: Heading1,
        label: "H1",
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: Heading2,
        label: "H2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: Heading3,
        label: "H3",
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        icon: Bold,
        label: "Bold",
        action: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
      },
      {
        icon: Italic,
        label: "Italic",
        action: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
      },
      {
        icon: Underline,
        label: "Underline",
        action: () => editor.chain().focus().toggleUnderline?.().run(),
        active: editor.isActive("underline"),
      },
      {
        icon: Strikethrough,
        label: "Strike",
        action: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
      },
    ],
    [
      {
        icon: List,
        label: "Bullet list",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered,
        label: "Ordered list",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
      {
        icon: Quote,
        label: "Blockquote",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
      },
    ],
    [
      {
        icon: Code,
        label: "Inline code",
        action: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
      },
      {
        icon: Code2,
        label: "Code block",
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        active: editor.isActive("codeBlock"),
      },
      {
        icon: Link,
        label: "Link",
        action: setLink,
        active: editor.isActive("link"),
      },
      { icon: Image, label: "Image", action: addImage, active: false },
    ],
    [
      {
        icon: Undo,
        label: "Undo",
        action: () => editor.chain().focus().undo().run(),
        active: false,
      },
      {
        icon: Redo,
        label: "Redo",
        action: () => editor.chain().focus().redo().run(),
        active: false,
      },
    ],
  ];

  return (
    <div className="flex items-center flex-wrap gap-1 p-2 border-b border-border">
      {tools.map((group, i) => (
        <div key={i} className="flex items-center gap-1">
          {group.map(({ icon: Icon, label, action, active }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={label}
              onClick={action}
              className={active ? "bg-muted" : ""}
            >
              <Icon width={15} height={15} />
            </Button>
          ))}
          {i < tools.length - 1 && (
            <Separator orientation="vertical" className="h-6 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}
