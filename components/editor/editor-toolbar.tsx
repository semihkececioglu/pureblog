"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  CheckSquare,
  Quote,
  Code,
  Code2,
  Link,
  ImageIcon,
  Undo,
  Redo,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Table,
  TableRowsSplit,
  Columns3,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EditorToolbarProps {
  editor: Editor | null;
}

// ── Inline Popover ────────────────────────────────────────────────────────────

function InlinePopover({
  open,
  onClose,
  onSubmit,
  placeholder,
  defaultValue,
  showUpload,
  onUpload,
  uploading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  defaultValue?: string;
  showUpload?: boolean;
  onUpload?: (file: File) => void;
  uploading?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue ?? "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border shadow-lg p-2 flex items-center gap-2 min-w-80">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-7 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit(value);
          }
          if (e.key === "Escape") onClose();
        }}
      />
      {showUpload && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onUpload) onUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs shrink-0"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3 h-3" />
          </Button>
        </>
      )}
      <Button
        size="sm"
        className="h-7 px-3 text-xs shrink-0"
        onClick={() => onSubmit(value)}
      >
        Apply
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs shrink-0"
        onClick={onClose}
      >
        ✕
      </Button>
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const closeAll = useCallback(() => {
    setLinkOpen(false);
    setImageOpen(false);
  }, []);

  if (!editor) return null;

  function handleSetLink(url: string) {
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setLinkOpen(false);
  }

  function handleAddImageUrl(url: string) {
    if (url) editor?.chain().focus().setImage({ src: url }).run();
    setImageOpen(false);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        editor?.chain().focus().setImage({ src: json.data.url }).run();
        setImageOpen(false);
        toast.success("Image uploaded.");
      } else {
        toast.error(json.error ?? "Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const currentLink = editor.isActive("link")
    ? (editor.getAttributes("link").href as string)
    : "";

  const isInTable = editor.isActive("table");

  const groups = [
    // Headings
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
    // Text formatting
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
        action: () => editor.chain().focus().toggleUnderline().run(),
        active: editor.isActive("underline"),
      },
      {
        icon: Strikethrough,
        label: "Strike",
        action: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
      },
      {
        icon: Highlighter,
        label: "Highlight",
        action: () => editor.chain().focus().toggleHighlight().run(),
        active: editor.isActive("highlight"),
      },
    ],
    // Alignment
    [
      {
        icon: AlignLeft,
        label: "Align left",
        action: () => editor.chain().focus().setTextAlign("left").run(),
        active: editor.isActive({ textAlign: "left" }),
      },
      {
        icon: AlignCenter,
        label: "Align center",
        action: () => editor.chain().focus().setTextAlign("center").run(),
        active: editor.isActive({ textAlign: "center" }),
      },
      {
        icon: AlignRight,
        label: "Align right",
        action: () => editor.chain().focus().setTextAlign("right").run(),
        active: editor.isActive({ textAlign: "right" }),
      },
    ],
    // Lists & blocks
    [
      {
        icon: List,
        label: "Bullet list",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered,
        label: "Numbered list",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
      {
        icon: CheckSquare,
        label: "Task list",
        action: () => editor.chain().focus().toggleTaskList().run(),
        active: editor.isActive("taskList"),
      },
      {
        icon: Quote,
        label: "Blockquote",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
      },
      {
        icon: Minus,
        label: "Divider",
        action: () => editor.chain().focus().setHorizontalRule().run(),
        active: false,
      },
    ],
    // Code
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
    ],
    // History
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
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="relative flex items-center flex-wrap gap-1 p-2">
        {groups.map((group, i) => (
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
            {i < groups.length - 1 && (
              <Separator orientation="vertical" className="h-5 mx-1" />
            )}
          </div>
        ))}

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Link */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Link"
            onClick={() => {
              closeAll();
              setLinkOpen((v) => !v);
            }}
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

        {/* Image */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Image"
            onClick={() => {
              closeAll();
              setImageOpen((v) => !v);
            }}
            className="h-7 w-7"
          >
            <ImageIcon width={14} height={14} />
          </Button>
          <InlinePopover
            open={imageOpen}
            onClose={() => setImageOpen(false)}
            onSubmit={handleAddImageUrl}
            placeholder="https://example.com/image.jpg"
            showUpload
            onUpload={handleImageUpload}
            uploading={uploading}
          />
        </div>

        {/* Insert Table */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={`h-7 w-7 ${isInTable ? "bg-muted" : ""}`}
        >
          <Table width={14} height={14} />
        </Button>
      </div>

      {/* Table controls (only when cursor is inside a table) */}
      {isInTable && (
        <div className="flex items-center gap-1 px-2 pb-1.5 border-t border-border/50 pt-1">
          <span className="text-[10px] text-muted-foreground mr-1 font-medium uppercase tracking-wide">
            Table:
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <TableRowsSplit width={12} height={12} />
            Add row
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns3 width={12} height={12} />
            Add col
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Trash2 width={12} height={12} />
            Del row
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Trash2 width={12} height={12} />
            Del col
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 width={12} height={12} />
            Delete table
          </Button>
        </div>
      )}
    </div>
  );
}
