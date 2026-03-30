"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  Pilcrow, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Quote, Code, Code2,
  Link as LinkIcon, ImageIcon, Upload, Youtube, Clapperboard,
  Table, Minus, Smile, FunctionSquare,
  Info, AlertTriangle, Lightbulb, ShieldAlert,
  Columns2, ChevronRight, BookOpen,
  Highlighter,
  Superscript, Subscript, Type,
  Search, Download, Maximize2, Minimize2,
  TableRowsSplit, Columns3, Trash2, ChevronDown,
  Undo, Redo, Wrench, Plus,
  ChevronsLeftRight, Combine, Split, ToggleLeft,
  PaintBucket, Captions, ArrowDownToLine, ArrowUpToLine,
  ArrowLeftToLine, ArrowRightToLine,
  IndentIncrease, IndentDecrease,
  FileText, Keyboard, Printer,
  Palette, ALargeSmall,
  Music, Twitter, Paperclip,
  Eye,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ToolbarDropdown, DropdownItem, DropdownSeparator } from "./toolbar-dropdown";
import { FindReplace } from "./find-replace";
import { SourceView } from "./source-view";
import { TablePicker } from "./table-picker";

// ── Types ─────────────────────────────────────────────────────────────────────

type OpenDropdown = "text" | "style" | "color" | "font" | "lists" | "insert" | "blocks" | "tools" | null;
type OpenPanel = "link" | "image" | "youtube" | "vimeo" | "math" | "emoji" | "find" | "html-insert" | "source" | "file" | "table-picker" | null;

interface EditorToolbarProps {
  editor: Editor | null;
  zenMode: boolean;
  onToggleZen: () => void;
  typewriterMode: boolean;
  onToggleTypewriter: () => void;
  showFindReplace: boolean;
  onToggleFindReplace: () => void;
  onTogglePreview: () => void;
}

// ── Language list ─────────────────────────────────────────────────────────────

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

// ── Highlight colors ──────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#bbf7d0", label: "Green" },
  { color: "#bfdbfe", label: "Blue" },
  { color: "#fecaca", label: "Red" },
  { color: "#e9d5ff", label: "Purple" },
  { color: "#fed7aa", label: "Orange" },
];

const TEXT_COLORS = [
  { color: "inherit", label: "Default" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#a855f7", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#64748b", label: "Gray" },
];

// ── Markdown export ───────────────────────────────────────────────────────────

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"];
const LINE_HEIGHTS = [
  { label: "Tight", value: "1.2" },
  { label: "Normal", value: "1.5" },
  { label: "Relaxed", value: "1.75" },
  { label: "Loose", value: "2" },
];
const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, 'Cascadia Code', monospace" },
  { label: "Cursive", value: "'Dancing Script', cursive" },
  { label: "Rounded", value: "'Varela Round', sans-serif" },
];

function exportPlainText(editor: Editor) {
  const text = editor.state.doc.textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.txt";
  a.click();
  URL.revokeObjectURL(url);
}

async function exportMarkdown(editor: Editor) {
  const { default: TurndownService } = await import("turndown");
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  const html = editor.getHTML();
  const md = td.turndown(html);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.md";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Table context bar ─────────────────────────────────────────────────────────

const CELL_COLORS = [
  { color: null, label: "None" },
  { color: "#f1f5f9", label: "Gray" },
  { color: "#fef9c3", label: "Yellow" },
  { color: "#dcfce7", label: "Green" },
  { color: "#dbeafe", label: "Blue" },
  { color: "#fce7f3", label: "Pink" },
  { color: "#ede9fe", label: "Purple" },
  { color: "#fee2e2", label: "Red" },
];

function TBtn({
  onClick,
  title,
  children,
  danger,
  active,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active !== undefined ? active : undefined}
      onClick={onClick}
      className={`flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors whitespace-nowrap
        ${danger ? "text-destructive hover:bg-destructive/10" : active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

const TABLE_DENSITIES = [
  { value: "compact", label: "S", title: "Compact cells" },
  { value: "normal", label: "M", title: "Normal cells" },
  { value: "comfortable", label: "L", title: "Large cells" },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableContextBar({ editor, cx }: { editor: Editor; cx: () => any }) {
  const [showCellBg, setShowCellBg] = useState(false);
  const canMerge = editor.can().mergeCells();
  const canSplit = editor.can().splitCell();
  const currentDensity = editor.getAttributes("table").density ?? "normal";

  return (
    <div className="border-t border-border/50 bg-muted/20">
      {/* Row 1: groups */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 px-3 py-1.5">

        {/* Rows */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Rows</span>
          <TBtn title="Add row above" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <ArrowUpToLine className="w-3 h-3" /> Above
          </TBtn>
          <TBtn title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <ArrowDownToLine className="w-3 h-3" /> Below
          </TBtn>
          <TBtn title="Delete row" danger onClick={() => editor.chain().focus().deleteRow().run()}>
            <Trash2 className="w-3 h-3" />
          </TBtn>
        </div>

        <div className="w-px h-4 bg-border/60" />

        {/* Columns */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Cols</span>
          <TBtn title="Add column left" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <ArrowLeftToLine className="w-3 h-3" /> Left
          </TBtn>
          <TBtn title="Add column right" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <ArrowRightToLine className="w-3 h-3" /> Right
          </TBtn>
          <TBtn title="Delete column" danger onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Trash2 className="w-3 h-3" />
          </TBtn>
        </div>

        <div className="w-px h-4 bg-border/60" />

        {/* Cells */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Cells</span>
          <TBtn title="Merge selected cells" onClick={() => editor.chain().focus().mergeCells().run()} active={false}>
            <Combine className="w-3 h-3" />
            {canMerge ? "Merge" : <span className="opacity-40">Merge</span>}
          </TBtn>
          <TBtn title="Split cell" onClick={() => editor.chain().focus().splitCell().run()}>
            <Split className="w-3 h-3" />
            {canSplit ? "Split" : <span className="opacity-40">Split</span>}
          </TBtn>
          {/* Cell background */}
          <div className="relative">
            <TBtn title="Cell background color" onClick={() => setShowCellBg((v) => !v)} active={showCellBg}>
              <PaintBucket className="w-3 h-3" /> Bg
            </TBtn>
            {showCellBg && (
              <div className="absolute top-full left-0 mt-1 z-30 bg-background border border-border rounded-md shadow-lg p-2 flex gap-1 flex-wrap w-36">
                {CELL_COLORS.map(({ color, label }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={`Cell background ${label}`}
                    onClick={() => {
                      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
                      setShowCellBg(false);
                    }}
                    className="w-6 h-6 rounded border border-border hover:ring-2 ring-ring transition-all"
                    style={{ backgroundColor: color ?? "transparent" }}
                  >
                    {!color && <span className="text-[9px] text-muted-foreground flex items-center justify-center w-full h-full">✕</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-4 bg-border/60" />

        {/* Headers & Caption */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Toggle</span>
          <TBtn
            title="Toggle header row"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            active={editor.isActive("tableHeader")}
          >
            <ToggleLeft className="w-3 h-3" /> Header row
          </TBtn>
          <TBtn
            title="Toggle header column"
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          >
            <ChevronsLeftRight className="w-3 h-3" /> Header col
          </TBtn>
          <TBtn
            title="Insert table caption below"
            onClick={() => cx().insertTableCaption().run()}
          >
            <Captions className="w-3 h-3" /> Caption
          </TBtn>
        </div>

        <div className="w-px h-4 bg-border/60" />

        {/* Cell density */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Size</span>
          {TABLE_DENSITIES.map(({ value, label, title }) => (
            <TBtn
              key={value}
              title={title}
              active={currentDensity === value}
              onClick={() => editor.chain().focus().updateAttributes("table", { density: value }).run()}
            >
              {label}
            </TBtn>
          ))}
        </div>

        <div className="w-px h-4 bg-border/60" />

        {/* Delete table */}
        <TBtn title="Delete entire table" danger onClick={() => editor.chain().focus().deleteTable().run()}>
          <Trash2 className="w-3 h-3" /> Delete table
        </TBtn>
      </div>
    </div>
  );
}

// ── Panel forms (link, image, youtube, vimeo, math) ───────────────────────────

function PanelForm({
  fields,
  onSubmit,
  onClose,
  submitLabel = "Apply",
}: {
  fields: Array<{ placeholder: string; defaultValue?: string; id: string }>;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const vals = useRef<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.id, f.defaultValue ?? ""]))
  );

  return (
    <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 border-t border-border/60 bg-muted/10 flex-wrap">
      {fields.map((f, i) => (
        <Input
          key={f.id}
          autoFocus={i === 0}
          defaultValue={f.defaultValue ?? ""}
          placeholder={f.placeholder}
          className="h-7 text-sm w-56"
          onChange={(e) => {
            vals.current[f.id] = e.target.value;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit(vals.current);
            }
            if (e.key === "Escape") onClose();
          }}
        />
      ))}
      <Button size="sm" className="h-7 px-3 text-xs shrink-0" onClick={() => onSubmit(vals.current)}>
        {submitLabel}
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0" onClick={onClose}>
        ✕
      </Button>
    </div>
  );
}

// ── HTML Insert Panel ─────────────────────────────────────────────────────────

function HTMLInsertPanel({
  onInsert,
  onClose,
}: {
  onInsert: (html: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="border-t border-border/60 bg-muted/10">
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        <span className="text-xs font-medium text-muted-foreground">Paste HTML (table or any HTML)</span>
        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => { if (value.trim()) onInsert(value); }}
            disabled={!value.trim()}
          >
            Insert
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onClose}>✕</Button>
        </div>
      </div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={"<table>\n  <tr><th>Name</th><th>Value</th></tr>\n  <tr><td>Foo</td><td>Bar</td></tr>\n</table>"}
        className="w-full font-mono text-xs p-3 bg-background focus:outline-none resize-y min-h-28 max-h-64"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && value.trim()) onInsert(value);
        }}
      />
      <p className="text-[10px] text-muted-foreground px-3 pb-2">Ctrl+Enter to insert</p>
    </div>
  );
}

// ── Emoji Picker ──────────────────────────────────────────────────────────────

// ── File upload panel ─────────────────────────────────────────────────────────

function FileUploadPanel({
  onInsert,
  onClose,
}: {
  onInsert: (attrs: { src: string; filename: string; filesize?: number; filetype?: string }) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.data?.url) {
        onInsert({ src: json.data.url, filename: file.name, filesize: file.size, filetype: file.type });
      } else {
        toast.error(json.error ?? "Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 border-t border-border/60 bg-muted/10 flex-wrap">
      <Input
        autoFocus
        value={urlValue}
        onChange={(e) => setUrlValue(e.target.value)}
        placeholder="https://example.com/file.pdf"
        className="h-7 text-sm w-64"
        onKeyDown={(e) => {
          if (e.key === "Enter" && urlValue) {
            const filename = urlValue.split("/").pop() ?? "file";
            onInsert({ src: urlValue, filename });
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" disabled={uploading} onClick={() => fileRef.current?.click()} title="Upload file" aria-label="Upload file">
        <Upload className="w-3 h-3" />
      </Button>
      <Button size="sm" className="h-7 px-3 text-xs shrink-0" disabled={!urlValue} onClick={() => { const filename = urlValue.split("/").pop() ?? "file"; onInsert({ src: urlValue, filename }); }}>Insert</Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onClose}>✕</Button>
    </div>
  );
}

// ── Emoji panel ───────────────────────────────────────────────────────────────

function EmojiPanel({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [EmojiPicker, setEmojiPicker] = useState<React.ComponentType<{ data: unknown; onEmojiSelect: (e: { native: string }) => void; theme: string }> | null>(null);
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    Promise.all([
      import("@emoji-mart/react").then((m) => m.default),
      import("@emoji-mart/data").then((m) => m.default),
    ]).then(([Picker, emojiData]) => {
      setEmojiPicker(() => Picker as typeof EmojiPicker);
      setData(emojiData);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!EmojiPicker || !data) {
    return (
      <div className="px-3 py-4 text-sm text-muted-foreground">Loading emojis…</div>
    );
  }

  return (
    <div>
      <EmojiPicker
        data={data}
        onEmojiSelect={(e) => {
          onSelect(e.native);
          onClose();
        }}
        theme="auto"
      />
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

export function EditorToolbar({
  editor,
  zenMode,
  onToggleZen,
  typewriterMode,
  onToggleTypewriter,
  showFindReplace,
  onToggleFindReplace,
  onTogglePreview,
}: EditorToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = useCallback(
    (name: OpenDropdown) => {
      setOpenDropdown((prev) => (prev === name ? null : name));
      setOpenPanel(null);
    },
    []
  );

  const closeAll = useCallback(() => {
    setOpenDropdown(null);
    setOpenPanel(null);
  }, []);

  const openPanelFn = useCallback((panel: OpenPanel) => {
    setOpenDropdown(null);
    setOpenPanel(panel);
  }, []);

  if (!editor) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cx = () => (editor.chain().focus() as any);

  const isInTable = editor.isActive("table");
  const isInCodeBlock = editor.isActive("codeBlock");
  const currentLang = editor.getAttributes("codeBlock").language ?? "plaintext";
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  // Current text style label for Text dropdown
  const headingLevel = [1, 2, 3, 4].find((l) => editor.isActive("heading", { level: l }));
  const textLabel = headingLevel ? `H${headingLevel}` : "Text";

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.data?.url) {
        editor!.chain().focus().setImage({ src: json.data.url }).run();
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

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      {/* ── Main toolbar row ── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">

        {/* Text dropdown */}
        <ToolbarDropdown
          icon={Type}
          label={textLabel}
          isOpen={openDropdown === "text"}
          onToggle={() => toggleDropdown("text")}
          onClose={() => setOpenDropdown(null)}
          width="w-44"
          active={headingLevel !== undefined}
          drawerTitle="Text & Alignment"
        >
          <DropdownItem icon={Pilcrow} label="Paragraph" active={editor.isActive("paragraph") && !headingLevel} onClick={() => { editor.chain().focus().setParagraph().run(); closeAll(); }} />
          <DropdownItem icon={Heading1} label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => { editor.chain().focus().setHeading({ level: 1 }).run(); closeAll(); }} />
          <DropdownItem icon={Heading2} label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => { editor.chain().focus().setHeading({ level: 2 }).run(); closeAll(); }} />
          <DropdownItem icon={Heading3} label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => { editor.chain().focus().setHeading({ level: 3 }).run(); closeAll(); }} />
          <DropdownItem icon={Heading4} label="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => { editor.chain().focus().setHeading({ level: 4 }).run(); closeAll(); }} />
          <DropdownSeparator />
          <DropdownItem icon={AlignLeft} label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => { editor.chain().focus().setTextAlign("left").run(); closeAll(); }} />
          <DropdownItem icon={AlignCenter} label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => { editor.chain().focus().setTextAlign("center").run(); closeAll(); }} />
          <DropdownItem icon={AlignRight} label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => { editor.chain().focus().setTextAlign("right").run(); closeAll(); }} />
          <DropdownItem icon={AlignJustify} label="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => { editor.chain().focus().setTextAlign("justify").run(); closeAll(); }} />
        </ToolbarDropdown>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Always-visible: B I U */}
        {([
          { icon: Bold, label: "Bold", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
          { icon: Italic, label: "Italic", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
          { icon: Underline, label: "Underline", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
          { icon: Strikethrough, label: "Strike", action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
        ] as Array<{ icon: typeof Bold; label: string; action: () => void; active: boolean }>).map(({ icon: Icon, label, action, active }) => (
          <Button
            key={label}
            type="button" variant="ghost" size="icon"
            aria-label={label} title={label}
            onClick={action}
            className={`h-7 w-7 ${active ? "bg-muted" : ""}`}
          >
            <Icon width={14} height={14} />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Style dropdown — superscript / subscript / inline code */}
        <ToolbarDropdown
          icon={Highlighter}
          label="Style"
          isOpen={openDropdown === "style"}
          onToggle={() => toggleDropdown("style")}
          onClose={() => setOpenDropdown(null)}
          width="w-44"
          active={editor.isActive("superscript") || editor.isActive("subscript") || editor.isActive("code")}
          drawerTitle="Text Style"
        >
          <DropdownItem icon={Superscript} label="Superscript" active={editor.isActive("superscript")} onClick={() => { cx().toggleSuperscript().run(); }} />
          <DropdownItem icon={Subscript} label="Subscript" active={editor.isActive("subscript")} onClick={() => { cx().toggleSubscript().run(); }} />
          <DropdownItem icon={Code} label="Inline code" active={editor.isActive("code")} onClick={() => { editor.chain().focus().toggleCode().run(); }} />
        </ToolbarDropdown>

        {/* Color dropdown — highlight + text color */}
        <ToolbarDropdown
          icon={Palette}
          label="Color"
          isOpen={openDropdown === "color"}
          onToggle={() => toggleDropdown("color")}
          onClose={() => setOpenDropdown(null)}
          width="w-56"
          active={editor.isActive("highlight")}
          drawerTitle="Color"
        >
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Highlight</p>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetHighlight().run(); }}
                className="w-5 h-5 rounded border border-border bg-background hover:ring-2 ring-ring"
                title="No highlight"
                aria-label="Remove highlight"
              >
                <span className="text-[9px] text-muted-foreground">✕</span>
              </button>
              {HIGHLIGHT_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  aria-label={`Highlight ${label}`}
                  onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); }}
                  className="w-5 h-5 rounded border border-border hover:ring-2 ring-ring"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="px-3 pt-1 pb-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Text color</p>
            <div className="flex items-center gap-1 flex-wrap">
              {TEXT_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  aria-label={`Text color ${label}`}
                  onClick={() => {
                    if (color === "inherit") cx().unsetColor().run();
                    else cx().setColor(color).run();
                  }}
                  className="w-5 h-5 rounded border border-border hover:ring-2 ring-ring flex items-center justify-center"
                  style={{ backgroundColor: color === "inherit" ? "transparent" : color }}
                >
                  {color === "inherit" && <span className="text-[9px]">A</span>}
                </button>
              ))}
            </div>
          </div>
        </ToolbarDropdown>

        {/* Font dropdown — family / size / line height */}
        <ToolbarDropdown
          icon={ALargeSmall}
          label="Font"
          isOpen={openDropdown === "font"}
          onToggle={() => toggleDropdown("font")}
          onClose={() => setOpenDropdown(null)}
          width="w-60"
          drawerTitle="Font"
        >
          {/* Font family */}
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Family</p>
            <div className="flex flex-col gap-0.5">
              {FONT_FAMILIES.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (!value) cx().unsetFontFamily().run();
                    else cx().setFontFamily(value).run();
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm border transition-colors ${
                    editor.isActive("textStyle", { fontFamily: value }) && value
                      ? "bg-muted border-border font-medium"
                      : !value && !FONT_FAMILIES.slice(1).some(f => editor.isActive("textStyle", { fontFamily: f.value }))
                      ? "bg-muted border-border font-medium"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                  style={{ fontFamily: value || "inherit" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <DropdownSeparator />
          {/* Font size */}
          <div className="px-3 pt-1 pb-1">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Size</p>
            <div className="flex items-center gap-1 flex-wrap">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  title={size}
                  onClick={() => { cx().setFontSize(size).run(); }}
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                    editor.isActive("textStyle", { fontSize: size })
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                title="Reset"
                onClick={() => { cx().unsetFontSize().run(); }}
                className="px-1.5 py-0.5 rounded text-[10px] border border-border hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Line height */}
          <div className="px-3 pt-1 pb-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Line height</p>
            <div className="flex items-center gap-1 flex-wrap">
              {LINE_HEIGHTS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { cx().setLineHeight(value).run(); }}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    editor.isActive({ lineHeight: value })
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { cx().unsetLineHeight().run(); }}
                className="px-1.5 py-0.5 rounded text-[10px] border border-border hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </ToolbarDropdown>

        {/* Indent / Outdent */}
        <Button type="button" variant="ghost" size="icon" title="Outdent (Shift+Tab)" aria-label="Outdent" onClick={() => cx().outdent().run()} className="h-7 w-7">
          <IndentDecrease width={14} height={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" title="Indent (Tab)" aria-label="Indent" onClick={() => cx().indent().run()} className="h-7 w-7">
          <IndentIncrease width={14} height={14} />
        </Button>

        {/* Lists dropdown */}
        <ToolbarDropdown
          icon={List}
          label="Lists"
          isOpen={openDropdown === "lists"}
          onToggle={() => toggleDropdown("lists")}
          onClose={() => setOpenDropdown(null)}
          width="w-44"
          active={editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("taskList")}
          drawerTitle="Lists"
        >
          <DropdownItem icon={List} label="Bullet list" active={editor.isActive("bulletList")} onClick={() => { editor.chain().focus().toggleBulletList().run(); closeAll(); }} />
          <DropdownItem icon={ListOrdered} label="Numbered list" active={editor.isActive("orderedList")} onClick={() => { editor.chain().focus().toggleOrderedList().run(); closeAll(); }} />
          <DropdownItem icon={CheckSquare} label="Task list" active={editor.isActive("taskList")} onClick={() => { editor.chain().focus().toggleTaskList().run(); closeAll(); }} />
        </ToolbarDropdown>

        {/* Insert dropdown */}
        <ToolbarDropdown
          icon={Plus}
          label="Insert"
          isOpen={openDropdown === "insert"}
          onToggle={() => toggleDropdown("insert")}
          onClose={() => setOpenDropdown(null)}
          width="w-48"
          drawerTitle="Insert"
        >
          <DropdownItem icon={LinkIcon} label="Link" onClick={() => openPanelFn("link")} />
          <DropdownItem icon={ImageIcon} label="Image" onClick={() => openPanelFn("image")} />
          <DropdownItem icon={Youtube} label="YouTube" onClick={() => openPanelFn("youtube")} />
          <DropdownItem icon={Clapperboard} label="Vimeo" onClick={() => openPanelFn("vimeo")} />
          <DropdownSeparator />
          <DropdownItem icon={Table} label="Table…" onClick={() => openPanelFn("table-picker")} />
          <DropdownItem icon={Code2} label="Table from HTML" onClick={() => openPanelFn("html-insert")} />
          <DropdownItem icon={FunctionSquare} label="Math equation" onClick={() => openPanelFn("math")} />
          <DropdownItem icon={Smile} label="Emoji" onClick={() => openPanelFn("emoji")} />
          <DropdownSeparator />
          <DropdownItem icon={Minus} label="Divider" onClick={() => { editor.chain().focus().setHorizontalRule().run(); closeAll(); }} />
          <DropdownSeparator />
          <DropdownItem icon={Music} label="Audio" onClick={() => {
            const url = window.prompt("Audio URL (mp3, ogg, wav):");
            if (url) { const title = window.prompt("Title (optional):") ?? undefined; cx().setAudio({ src: url, title }).run(); closeAll(); }
          }} />
          <DropdownItem icon={Twitter} label="Tweet / X Post" onClick={() => {
            const url = window.prompt("Twitter / X post URL:");
            if (url) { cx().setTweet(url).run(); closeAll(); }
          }} />
          <DropdownItem icon={Code2} label="Code Embed" onClick={() => {
            const url = window.prompt("CodePen / StackBlitz / CodeSandbox URL:");
            if (url) { cx().setCodeSandbox(url).run(); closeAll(); }
          }} />
          <DropdownItem icon={Paperclip} label="File Attachment" onClick={() => openPanelFn("file")} />
        </ToolbarDropdown>

        {/* Blocks dropdown */}
        <ToolbarDropdown
          icon={BookOpen}
          label="Blocks"
          isOpen={openDropdown === "blocks"}
          onToggle={() => toggleDropdown("blocks")}
          onClose={() => setOpenDropdown(null)}
          width="w-48"
          active={editor.isActive("blockquote") || editor.isActive("codeBlock") || editor.isActive("callout") || editor.isActive("details") || editor.isActive("columns")}
          drawerTitle="Blocks"
        >
          <DropdownItem icon={Quote} label="Blockquote" active={editor.isActive("blockquote")} onClick={() => { editor.chain().focus().toggleBlockquote().run(); closeAll(); }} />
          <DropdownItem icon={Code2} label="Code block" active={editor.isActive("codeBlock")} onClick={() => { editor.chain().focus().toggleCodeBlock().run(); closeAll(); }} />
          <DropdownSeparator />
          <DropdownItem icon={Info} label="Info" iconClassName="text-blue-500" onClick={() => { cx().setCallout("info").run(); closeAll(); }} />
          <DropdownItem icon={AlertTriangle} label="Warning" iconClassName="text-amber-500" onClick={() => { cx().setCallout("warning").run(); closeAll(); }} />
          <DropdownItem icon={Lightbulb} label="Tip" iconClassName="text-emerald-500" onClick={() => { cx().setCallout("tip").run(); closeAll(); }} />
          <DropdownItem icon={ShieldAlert} label="Danger" iconClassName="text-red-500" onClick={() => { cx().setCallout("danger").run(); closeAll(); }} />
          <DropdownSeparator />
          <DropdownItem icon={ChevronRight} label="Collapsible" active={editor.isActive("details")} onClick={() => { cx().setDetails().run(); closeAll(); }} />
          <DropdownItem icon={Columns2} label="2 Columns" active={editor.isActive("columns")} onClick={() => { cx().setColumns(2).run(); closeAll(); }} />
          <DropdownItem icon={Columns3} label="3 Columns" onClick={() => { cx().setColumns(3).run(); closeAll(); }} />
        </ToolbarDropdown>

        {/* Tools dropdown */}
        <ToolbarDropdown
          icon={Wrench}
          label="Tools"
          isOpen={openDropdown === "tools"}
          onToggle={() => toggleDropdown("tools")}
          onClose={() => setOpenDropdown(null)}
          width="w-48"
          drawerTitle="Tools"
        >
          <DropdownItem
            icon={Search}
            label="Find & Replace"
            shortcut="Ctrl+H"
            active={showFindReplace}
            onClick={() => { onToggleFindReplace(); closeAll(); }}
          />
          <DropdownItem
            icon={Code2}
            label="Source view"
            active={openPanel === "source"}
            onClick={() => { openPanelFn(openPanel === "source" ? null : "source"); setOpenDropdown(null); }}
          />
          <DropdownSeparator />
          <DropdownItem
            icon={Download}
            label="Export Markdown"
            onClick={() => { exportMarkdown(editor); closeAll(); }}
          />
          <DropdownItem
            icon={FileText}
            label="Export plain text"
            onClick={() => { exportPlainText(editor); closeAll(); }}
          />
          <DropdownItem
            icon={Printer}
            label="Print / Save as PDF"
            onClick={() => { closeAll(); setTimeout(() => window.print(), 100); }}
          />
          <DropdownSeparator />
          <DropdownItem
            icon={Keyboard}
            label="Typewriter mode"
            active={typewriterMode}
            onClick={() => { onToggleTypewriter(); closeAll(); }}
          />
        </ToolbarDropdown>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Preview */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Preview post"
          aria-label="Preview post"
          onClick={onTogglePreview}
          className="h-7 w-7"
        >
          <Eye width={14} height={14} />
        </Button>

        {/* Zen mode */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={zenMode ? "Exit zen mode (Esc)" : "Zen mode"}
          aria-label={zenMode ? "Exit zen mode" : "Zen mode"}
          aria-pressed={zenMode}
          onClick={() => { onToggleZen(); }}
          className={`h-7 w-7 ${zenMode ? "bg-muted" : ""}`}
        >
          {zenMode ? <Minimize2 width={14} height={14} /> : <Maximize2 width={14} height={14} />}
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Undo / Redo */}
        <Button type="button" variant="ghost" size="icon" title="Undo (Ctrl+Z)" aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo} className="h-7 w-7">
          <Undo width={14} height={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" title="Redo" aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo} className="h-7 w-7">
          <Redo width={14} height={14} />
        </Button>
      </div>

      {/* ── Panel forms ── */}

      {openPanel === "link" && (
        <PanelForm
          fields={[
            { id: "url", placeholder: "https://example.com", defaultValue: editor.isActive("link") ? editor.getAttributes("link").href : "" },
          ]}
          onSubmit={({ url }) => {
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
            setOpenPanel(null);
          }}
          onClose={() => setOpenPanel(null)}
          submitLabel="Set link"
        />
      )}

      {openPanel === "image" && (
        <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 border-t border-border/60 bg-muted/10 flex-wrap">
          <Input autoFocus id="img-url" placeholder="https://example.com/image.jpg" className="h-7 text-sm w-56" onKeyDown={(e) => { if (e.key === "Enter") { const url = (document.getElementById("img-url") as HTMLInputElement).value; const alt = (document.getElementById("img-alt") as HTMLInputElement)?.value ?? ""; if (url) editor.chain().focus().setImage({ src: url, alt }).run(); setOpenPanel(null); } if (e.key === "Escape") setOpenPanel(null); }} />
          <Input id="img-alt" placeholder="Alt text (optional)" className="h-7 text-sm w-44" onKeyDown={(e) => e.key === "Escape" && setOpenPanel(null)} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" disabled={uploading} onClick={() => fileInputRef.current?.click()} title="Upload image" aria-label="Upload image"><Upload className="w-3 h-3" /></Button>
          <Button size="sm" className="h-7 px-3 text-xs shrink-0" onClick={() => { const url = (document.getElementById("img-url") as HTMLInputElement).value; const alt = (document.getElementById("img-alt") as HTMLInputElement)?.value ?? ""; if (url) editor.chain().focus().setImage({ src: url, alt }).run(); setOpenPanel(null); }}>Insert</Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setOpenPanel(null)}>✕</Button>
        </div>
      )}

      {openPanel === "youtube" && (
        <PanelForm
          fields={[{ id: "url", placeholder: "https://youtube.com/watch?v=..." }]}
          onSubmit={({ url }) => {
            if (url) { try { cx().setYoutubeVideo({ src: url }).run(); } catch { toast.error("Invalid YouTube URL."); } }
            setOpenPanel(null);
          }}
          onClose={() => setOpenPanel(null)}
          submitLabel="Embed"
        />
      )}

      {openPanel === "vimeo" && (
        <PanelForm
          fields={[{ id: "url", placeholder: "https://vimeo.com/123456789" }]}
          onSubmit={({ url }) => {
            if (url) cx().setVimeoVideo(url).run();
            setOpenPanel(null);
          }}
          onClose={() => setOpenPanel(null)}
          submitLabel="Embed"
        />
      )}

      {openPanel === "math" && (
        <PanelForm
          fields={[{ id: "latex", placeholder: "E = mc^2  (LaTeX formula)" }]}
          onSubmit={({ latex }) => {
            if (latex) cx().setBlockMath(latex).run();
            setOpenPanel(null);
          }}
          onClose={() => setOpenPanel(null)}
          submitLabel="Insert"
        />
      )}

      {openPanel === "emoji" && (
        <div className="border-t border-border/60">
          <EmojiPanel
            onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()}
            onClose={() => setOpenPanel(null)}
          />
        </div>
      )}

      {openPanel === "file" && (
        <FileUploadPanel
          onInsert={(attrs) => { cx().setFileAttachment(attrs).run(); setOpenPanel(null); }}
          onClose={() => setOpenPanel(null)}
        />
      )}

      {openPanel === "table-picker" && (
        <div className="border-t border-border/60 bg-muted/10">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40">
            <span className="text-xs font-medium">Insert Table</span>
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => setOpenPanel(null)}>
              <span className="text-xs">✕</span>
            </Button>
          </div>
          <TablePicker
            onInsert={(rows, cols, density) => {
              cx()
                .insertTable({ rows, cols, withHeaderRow: true })
                .updateAttributes("table", { density })
                .run();
              setOpenPanel(null);
            }}
          />
        </div>
      )}

      {/* ── Contextual: code language selector ── */}
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
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Contextual: table controls ── */}
      {isInTable && <TableContextBar editor={editor} cx={cx} />}

      {/* ── Find & Replace ── */}
      {showFindReplace && (
        <FindReplace editor={editor} onClose={onToggleFindReplace} />
      )}

      {/* ── Insert from HTML ── */}
      {openPanel === "html-insert" && (
        <HTMLInsertPanel
          onInsert={(html) => {
            editor.chain().focus().insertContent(html).run();
            setOpenPanel(null);
          }}
          onClose={() => setOpenPanel(null)}
        />
      )}

      {/* ── Source view (HTML / Markdown) ── */}
      {openPanel === "source" && (
        <SourceView editor={editor} onClose={() => setOpenPanel(null)} />
      )}
    </div>
  );
}
