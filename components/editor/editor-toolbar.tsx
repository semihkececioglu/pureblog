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
  Superscript,
  Subscript,
  Youtube,
  Maximize2,
  Minimize2,
  Search,
  Info,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FindReplace } from "./find-replace";
import type { CalloutType } from "./callout-extension";

interface EditorToolbarProps {
  editor: Editor | null;
  zenMode: boolean;
  onToggleZen: () => void;
  showFindReplace: boolean;
  onToggleFindReplace: () => void;
}

// ── Code language list ────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
];

// ── Callout types ─────────────────────────────────────────────────────────────

const CALLOUT_TYPES: Array<{
  type: CalloutType;
  label: string;
  Icon: typeof Info;
  color: string;
}> = [
  { type: "info", label: "Info", Icon: Info, color: "text-blue-500" },
  { type: "warning", label: "Warning", Icon: AlertTriangle, color: "text-amber-500" },
  { type: "tip", label: "Tip", Icon: Lightbulb, color: "text-emerald-500" },
  { type: "danger", label: "Danger", Icon: ShieldAlert, color: "text-red-500" },
];

// ── Inline Popover ────────────────────────────────────────────────────────────

function InlinePopover({
  open,
  onClose,
  onSubmit,
  fields,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: string[]) => void;
  fields: Array<{ placeholder: string; defaultValue?: string }>;
}) {
  const [values, setValues] = useState<string[]>([]);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValues(fields.map((f) => f.defaultValue ?? ""));
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [open, fields]);

  if (!open) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border shadow-lg p-2 flex flex-col gap-1.5 min-w-80">
      {fields.map((field, i) => (
        <Input
          key={i}
          ref={i === 0 ? firstRef : undefined}
          value={values[i] ?? ""}
          onChange={(e) => {
            const next = [...values];
            next[i] = e.target.value;
            setValues(next);
          }}
          placeholder={field.placeholder}
          className="h-7 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); onSubmit(values); }
            if (e.key === "Escape") onClose();
          }}
        />
      ))}
      <div className="flex items-center gap-1.5">
        <Button size="sm" className="h-7 px-3 text-xs" onClick={() => onSubmit(values)}>
          Apply
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onClose}>
          ✕
        </Button>
      </div>
    </div>
  );
}

// ── Main Toolbar ──────────────────────────────────────────────────────────────

export function EditorToolbar({
  editor,
  zenMode,
  onToggleZen,
  showFindReplace,
  onToggleFindReplace,
}: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeAll = useCallback(() => {
    setLinkOpen(false);
    setImageOpen(false);
    setYoutubeOpen(false);
    setCalloutOpen(false);
  }, []);

  if (!editor) return null;

  const isInTable = editor.isActive("table");
  const isInCodeBlock = editor.isActive("codeBlock");
  const currentLang = editor.getAttributes("codeBlock").language ?? "plaintext";

  function handleSetLink([url]: string[]) {
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setLinkOpen(false);
  }

  function handleAddImage([url, alt]: string[]) {
    if (url) editor?.chain().focus().setImage({ src: url, alt }).run();
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

  function handleYoutube([url]: string[]) {
    if (url) {
      try {
        editor?.chain().focus().setYoutubeVideo({ src: url }).run();
      } catch {
        toast.error("Invalid YouTube URL.");
      }
    }
    setYoutubeOpen(false);
  }

  const currentLink = editor.isActive("link")
    ? (editor.getAttributes("link").href as string)
    : "";

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  const groups = [
    // Headings
    [
      { icon: Heading1, label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
      { icon: Heading2, label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
      { icon: Heading3, label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    ],
    // Text formatting
    [
      { icon: Bold, label: "Bold", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
      { icon: Italic, label: "Italic", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
      { icon: Underline, label: "Underline", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
      { icon: Strikethrough, label: "Strike", action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
      { icon: Superscript, label: "Superscript", action: () => editor.chain().focus().toggleSuperscript().run(), active: editor.isActive("superscript") },
      { icon: Subscript, label: "Subscript", action: () => editor.chain().focus().toggleSubscript().run(), active: editor.isActive("subscript") },
      { icon: Highlighter, label: "Highlight", action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive("highlight") },
    ],
    // Alignment
    [
      { icon: AlignLeft, label: "Align left", action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }) },
      { icon: AlignCenter, label: "Align center", action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }) },
      { icon: AlignRight, label: "Align right", action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }) },
    ],
    // Lists & blocks
    [
      { icon: List, label: "Bullet list", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
      { icon: ListOrdered, label: "Numbered list", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
      { icon: CheckSquare, label: "Task list", action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive("taskList") },
      { icon: Quote, label: "Blockquote", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
      { icon: Minus, label: "Divider", action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    ],
    // Code
    [
      { icon: Code, label: "Inline code", action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code") },
      { icon: Code2, label: "Code block", action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
    ],
  ];

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="relative flex items-center flex-wrap gap-0.5 p-1.5">
        {/* Main groups */}
        {groups.map((group, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {group.map(({ icon: Icon, label, action, active }) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={label}
                title={label}
                onClick={action}
                className={`h-7 w-7 ${active ? "bg-muted" : ""}`}
              >
                <Icon width={14} height={14} />
              </Button>
            ))}
            <Separator orientation="vertical" className="h-5 mx-0.5" />
          </div>
        ))}

        {/* Link */}
        <div className="relative">
          <Button
            type="button" variant="ghost" size="icon"
            aria-label="Link" title="Link"
            onClick={() => { closeAll(); setLinkOpen((v) => !v); }}
            className={`h-7 w-7 ${editor.isActive("link") ? "bg-muted" : ""}`}
          >
            <Link width={14} height={14} />
          </Button>
          <InlinePopover
            open={linkOpen}
            onClose={() => setLinkOpen(false)}
            onSubmit={handleSetLink}
            fields={[{ placeholder: "https://example.com", defaultValue: currentLink }]}
          />
        </div>

        {/* Image (URL + Upload) */}
        <div className="relative">
          <Button
            type="button" variant="ghost" size="icon"
            aria-label="Image" title="Image"
            onClick={() => { closeAll(); setImageOpen((v) => !v); }}
            className="h-7 w-7"
          >
            <ImageIcon width={14} height={14} />
          </Button>
          {imageOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border shadow-lg p-2 flex flex-col gap-1.5 min-w-80">
              <div className="flex items-center gap-1.5">
                <Input
                  autoFocus
                  placeholder="https://example.com/image.jpg"
                  className="h-7 text-sm flex-1"
                  id="img-url"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddImage([(e.target as HTMLInputElement).value, ""]);
                    }
                    if (e.key === "Escape") setImageOpen(false);
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button" size="sm" variant="outline"
                  className="h-7 px-2 text-xs shrink-0"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image"
                >
                  <Upload className="w-3 h-3" />
                </Button>
              </div>
              <Input
                placeholder="Alt text (optional)"
                className="h-7 text-sm"
                id="img-alt"
                onKeyDown={(e) => e.key === "Escape" && setImageOpen(false)}
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm" className="h-7 px-3 text-xs"
                  onClick={() => {
                    const url = (document.getElementById("img-url") as HTMLInputElement)?.value;
                    const alt = (document.getElementById("img-alt") as HTMLInputElement)?.value;
                    handleAddImage([url, alt]);
                  }}
                >
                  Insert
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setImageOpen(false)}>✕</Button>
              </div>
            </div>
          )}
        </div>

        {/* YouTube */}
        <div className="relative">
          <Button
            type="button" variant="ghost" size="icon"
            aria-label="YouTube embed" title="YouTube embed"
            onClick={() => { closeAll(); setYoutubeOpen((v) => !v); }}
            className="h-7 w-7"
          >
            <Youtube width={14} height={14} />
          </Button>
          <InlinePopover
            open={youtubeOpen}
            onClose={() => setYoutubeOpen(false)}
            onSubmit={handleYoutube}
            fields={[{ placeholder: "https://youtube.com/watch?v=..." }]}
          />
        </div>

        {/* Callout dropdown */}
        <div className="relative">
          <Button
            type="button" variant="ghost" size="icon"
            aria-label="Callout" title="Callout"
            onClick={() => { closeAll(); setCalloutOpen((v) => !v); }}
            className={`h-7 w-7 ${editor.isActive("callout") ? "bg-muted" : ""}`}
          >
            <Info width={14} height={14} />
          </Button>
          {calloutOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border shadow-lg rounded-md p-1 w-40">
              {CALLOUT_TYPES.map(({ type, label, Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout(type).run();
                    setCalloutOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm hover:bg-muted transition-colors text-left"
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <Button
          type="button" variant="ghost" size="icon"
          aria-label="Insert table" title="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`h-7 w-7 ${isInTable ? "bg-muted" : ""}`}
        >
          <Table width={14} height={14} />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Find & Replace */}
        <Button
          type="button" variant="ghost" size="icon"
          aria-label="Find & Replace (Ctrl+H)" title="Find & Replace (Ctrl+H)"
          onClick={onToggleFindReplace}
          className={`h-7 w-7 ${showFindReplace ? "bg-muted" : ""}`}
        >
          <Search width={14} height={14} />
        </Button>

        {/* Zen mode */}
        <Button
          type="button" variant="ghost" size="icon"
          aria-label={zenMode ? "Exit zen mode" : "Zen mode"}
          title={zenMode ? "Exit zen mode (Esc)" : "Zen mode"}
          onClick={onToggleZen}
          className="h-7 w-7"
        >
          {zenMode ? <Minimize2 width={14} height={14} /> : <Maximize2 width={14} height={14} />}
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Undo / Redo */}
        <Button
          type="button" variant="ghost" size="icon"
          aria-label="Undo" title="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!canUndo}
          className="h-7 w-7"
        >
          <Undo width={14} height={14} />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          aria-label="Redo" title="Redo (Ctrl+Shift+Z)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!canRedo}
          className="h-7 w-7"
        >
          <Redo width={14} height={14} />
        </Button>
      </div>

      {/* Contextual: table controls */}
      {isInTable && (
        <div className="flex items-center gap-1 px-2 pb-1.5 border-t border-border/50 pt-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mr-1">
            Table:
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <TableRowsSplit width={12} height={12} /> Add row
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns3 width={12} height={12} /> Add col
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Trash2 width={12} height={12} /> Del row
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Trash2 width={12} height={12} /> Del col
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 width={12} height={12} /> Delete table
          </Button>
        </div>
      )}

      {/* Contextual: code block language selector */}
      {isInCodeBlock && (
        <div className="flex items-center gap-2 px-2 pb-1.5 border-t border-border/50 pt-1">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Language:
          </span>
          <div className="relative flex items-center">
            <select
              value={currentLang}
              onChange={(e) =>
                editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()
              }
              className="h-6 text-xs border border-border rounded-sm bg-background px-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Find & Replace panel */}
      {showFindReplace && (
        <FindReplace editor={editor} onClose={() => onToggleFindReplace()} />
      )}
    </div>
  );
}
