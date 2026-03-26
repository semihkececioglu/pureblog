"use client";

import { useState, useRef, useEffect } from "react";
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
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface EditorToolbarProps {
  editor: Editor | null;
}

function InlinePopover({
  open,
  onClose,
  onSubmit,
  placeholder,
  defaultValue,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue ?? "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border shadow-lg p-2 flex items-center gap-2 min-w-72">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-7 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSubmit(value); }
          if (e.key === "Escape") onClose();
        }}
      />
      <Button size="sm" className="h-7 px-3 text-xs shrink-0" onClick={() => onSubmit(value)}>
        Apply
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0" onClick={onClose}>
        ✕
      </Button>
    </div>
  );
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  if (!editor) return null;

  function handleSetLink(url: string) {
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setLinkOpen(false);
  }

  function handleAddImage(url: string) {
    if (url) editor?.chain().focus().setImage({ src: url }).run();
    setImageOpen(false);
  }

  const currentLink = editor.isActive("link")
    ? (editor.getAttributes("link").href as string)
    : "";

  const tools = [
    [
      {
        icon: Heading1, label: "H1",
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: Heading2, label: "H2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: Heading3, label: "H3",
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        icon: Bold, label: "Bold",
        action: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
      },
      {
        icon: Italic, label: "Italic",
        action: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
      },
      {
        icon: Underline, label: "Underline",
        action: () => editor.chain().focus().toggleUnderline().run(),
        active: editor.isActive("underline"),
      },
      {
        icon: Strikethrough, label: "Strike",
        action: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
      },
    ],
    [
      {
        icon: List, label: "Bullet list",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered, label: "Ordered list",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
      {
        icon: Quote, label: "Blockquote",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
      },
      {
        icon: Minus, label: "Divider",
        action: () => editor.chain().focus().setHorizontalRule().run(),
        active: false,
      },
    ],
    [
      {
        icon: Code, label: "Inline code",
        action: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
      },
      {
        icon: Code2, label: "Code block",
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        active: editor.isActive("codeBlock"),
      },
    ],
    [
      {
        icon: Undo, label: "Undo",
        action: () => editor.chain().focus().undo().run(),
        active: false,
      },
      {
        icon: Redo, label: "Redo",
        action: () => editor.chain().focus().redo().run(),
        active: false,
      },
    ],
  ];

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="relative flex items-center flex-wrap gap-1 p-2">
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
                className={`h-7 w-7 ${active ? "bg-muted" : ""}`}
              >
                <Icon width={14} height={14} />
              </Button>
            ))}
            {i < tools.length - 1 && (
              <Separator orientation="vertical" className="h-5 mx-1" />
            )}
          </div>
        ))}

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Link button */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Link"
            onClick={() => { setImageOpen(false); setLinkOpen((v) => !v); }}
            className={`h-7 w-7 ${editor.isActive("link") ? "bg-muted" : ""}`}
          >
            <Link width={14} height={14} />
          </Button>
          <InlinePopover
            open={linkOpen}
            onClose={() => setLinkOpen(false)}
            onSubmit={handleSetLink}
            placeholder="https://example.com"
            defaultValue={currentLink}
          />
        </div>

        {/* Image button */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Image"
            onClick={() => { setLinkOpen(false); setImageOpen((v) => !v); }}
            className="h-7 w-7"
          >
            <Image width={14} height={14} />
          </Button>
          <InlinePopover
            open={imageOpen}
            onClose={() => setImageOpen(false)}
            onSubmit={handleAddImage}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </div>
  );
}
