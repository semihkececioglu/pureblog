"use client";

import { Extension, Range, Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/suggestion";
import tippy, { Instance } from "tippy.js";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  Table,
  Info,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Youtube,
  Clapperboard,
  FunctionSquare,
  ChevronRight,
  Columns2,
  Columns3,
  ImageIcon,
  Captions,
  Sigma,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Music,
  Twitter,
  Paperclip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TablePicker, type TableDensity } from "./table-picker";
import "./extensions/vimeo";
import "./extensions/details";
import "./extensions/columns";
import "./extensions/math";

export interface CommandItem {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconColor?: string;
  category: string;
  subpanel?: "table-picker";
  command: (args: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
  // Text
  {
    title: "Text",
    description: "Plain paragraph",
    Icon: Pilcrow,
    category: "Text",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    Icon: Heading1,
    category: "Text",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    Icon: Heading2,
    category: "Text",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    Icon: Heading3,
    category: "Text",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Heading 4",
    description: "Smallest section heading",
    Icon: Heading4,
    category: "Text",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run(),
  },
  // Lists
  {
    title: "Bullet List",
    description: "Simple unordered list",
    Icon: List,
    category: "Lists",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list with numbers",
    Icon: ListOrdered,
    category: "Lists",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Todo list with checkboxes",
    Icon: CheckSquare,
    category: "Lists",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  // Blocks
  {
    title: "Quote",
    description: "Blockquote callout",
    Icon: Quote,
    category: "Blocks",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Code with syntax highlighting",
    Icon: Code2,
    category: "Blocks",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Insert a table — pick size & cell density",
    Icon: Table,
    category: "Blocks",
    subpanel: "table-picker",
    command: () => {}, // handled by subpanel inside SlashMenu
  },
  {
    title: "Table Caption",
    description: "Caption paragraph for a table",
    Icon: Captions,
    category: "Blocks",
    command: ({ editor, range }) =>
      (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { insertTableCaption: () => typeof editor.chain }).insertTableCaption().run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    Icon: Minus,
    category: "Blocks",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Collapsible",
    description: "Expandable details block",
    Icon: ChevronRight,
    category: "Blocks",
    command: ({ editor, range }) =>
      (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setDetails: () => typeof editor.chain }).setDetails().run(),
  },
  // Media
  {
    title: "Image",
    description: "Insert an image by URL",
    Icon: ImageIcon,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("Image URL:");
      if (url) editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
  {
    title: "YouTube",
    description: "Embed a YouTube video",
    Icon: Youtube,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("YouTube URL:");
      if (url) {
        try {
          (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setYoutubeVideo: (o: { src: string }) => typeof editor.chain }).setYoutubeVideo({ src: url }).run();
        } catch { /* invalid url */ }
      }
    },
  },
  {
    title: "Vimeo",
    description: "Embed a Vimeo video",
    Icon: Clapperboard,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("Vimeo URL:");
      if (url) (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setVimeoVideo: (u: string) => typeof editor.chain }).setVimeoVideo(url).run();
    },
  },
  {
    title: "Math Block",
    description: "Display math equation (LaTeX)",
    Icon: FunctionSquare,
    category: "Media",
    command: ({ editor, range }) => {
      const latex = window.prompt("LaTeX formula:", "E = mc^2");
      if (latex) (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setBlockMath: (l: string) => typeof editor.chain }).setBlockMath(latex).run();
    },
  },
  {
    title: "Inline Math",
    description: "Inline LaTeX formula",
    Icon: Sigma,
    category: "Media",
    command: ({ editor, range }) => {
      const latex = window.prompt("LaTeX formula:", "E = mc^2");
      if (latex) (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setInlineMath: (l: string) => typeof editor.chain }).setInlineMath(latex).run();
    },
  },
  {
    title: "Audio",
    description: "Embed an audio player",
    Icon: Music,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("Audio URL (mp3, ogg, wav):");
      if (url) {
        const title = window.prompt("Title (optional):") ?? undefined;
        (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setAudio: (a: { src: string; title?: string }) => typeof editor.chain }).setAudio({ src: url, title }).run();
      }
    },
  },
  {
    title: "Tweet / X Post",
    description: "Embed a tweet from X (Twitter)",
    Icon: Twitter,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("Twitter / X post URL:");
      if (url) (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setTweet: (u: string) => typeof editor.chain }).setTweet(url).run();
    },
  },
  {
    title: "Code Embed",
    description: "Embed CodePen, StackBlitz or CodeSandbox",
    Icon: Code2,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("CodePen / StackBlitz / CodeSandbox URL:");
      if (url) (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setCodeSandbox: (u: string) => typeof editor.chain }).setCodeSandbox(url).run();
    },
  },
  {
    title: "File Attachment",
    description: "Insert a downloadable file link",
    Icon: Paperclip,
    category: "Media",
    command: ({ editor, range }) => {
      const url = window.prompt("File URL:");
      if (url) {
        const filename = url.split("/").pop() ?? "file";
        (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setFileAttachment: (a: { src: string; filename: string }) => typeof editor.chain }).setFileAttachment({ src: url, filename }).run();
      }
    },
  },
  // Layout
  {
    title: "2 Columns",
    description: "Two-column layout",
    Icon: Columns2,
    category: "Layout",
    command: ({ editor, range }) =>
      (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setColumns: (n: number) => typeof editor.chain }).setColumns(2).run(),
  },
  {
    title: "3 Columns",
    description: "Three-column layout",
    Icon: Columns3,
    category: "Layout",
    command: ({ editor, range }) =>
      (editor.chain().focus().deleteRange(range) as ReturnType<typeof editor.chain> & { setColumns: (n: number) => typeof editor.chain }).setColumns(3).run(),
  },
  {
    title: "Align Left",
    description: "Align text to the left",
    Icon: AlignLeft,
    category: "Layout",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setTextAlign("left").run(),
  },
  {
    title: "Align Center",
    description: "Center-align text",
    Icon: AlignCenter,
    category: "Layout",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setTextAlign("center").run(),
  },
  {
    title: "Align Right",
    description: "Align text to the right",
    Icon: AlignRight,
    category: "Layout",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setTextAlign("right").run(),
  },
  {
    title: "Justify",
    description: "Justify text",
    Icon: AlignJustify,
    category: "Layout",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setTextAlign("justify").run(),
  },
  // Callouts
  {
    title: "Info",
    description: "Blue info callout box",
    Icon: Info,
    iconColor: "text-blue-500",
    category: "Callouts",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("info").run(),
  },
  {
    title: "Warning",
    description: "Yellow warning callout box",
    Icon: AlertTriangle,
    iconColor: "text-amber-500",
    category: "Callouts",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("warning").run(),
  },
  {
    title: "Tip",
    description: "Green tip callout box",
    Icon: Lightbulb,
    iconColor: "text-emerald-500",
    category: "Callouts",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("tip").run(),
  },
  {
    title: "Danger",
    description: "Red danger callout box",
    Icon: ShieldAlert,
    iconColor: "text-red-500",
    category: "Callouts",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("danger").run(),
  },
];

const CATEGORIES = ["Text", "Lists", "Blocks", "Media", "Callouts", "Layout"];

// ── Slash Menu UI ─────────────────────────────────────────────────────────────

interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashMenu = forwardRef<SlashMenuRef, SuggestionProps<CommandItem>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [tablePickerMode, setTablePickerMode] = useState(false);

    useEffect(() => { setSelectedIndex(0); setTablePickerMode(false); }, [props.items]);

    const selectItem = (item: CommandItem) => {
      if (item.subpanel === "table-picker") {
        setTablePickerMode(true);
        return;
      }
      props.command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown(event: KeyboardEvent): boolean {
        if (tablePickerMode) {
          if (event.key === "Escape") { setTablePickerMode(false); return true; }
          return false;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (i) => (i - 1 + props.items.length) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = props.items[selectedIndex];
          if (item) selectItem(item);
          return true;
        }
        return false;
      },
    }));

    if (!props.items.length) return null;

    // Table picker subpanel
    if (tablePickerMode) {
      return (
        <div className="bg-background border border-border rounded-md shadow-xl w-56">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
            <button
              type="button"
              aria-label="Back to commands"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTablePickerMode(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back
            </button>
            <span className="text-xs font-medium">Insert Table</span>
            <span className="w-8" />
          </div>
          <TablePicker
            onInsert={(rows, cols, density) => {
              (props.editor.chain().focus() as any)
                .deleteRange(props.range)
                .insertTable({ rows, cols, withHeaderRow: true })
                .updateAttributes("table", { density })
                .run();
            }}
          />
        </div>
      );
    }

    // Group items by category
    const grouped = CATEGORIES.reduce<Record<string, CommandItem[]>>((acc, cat) => {
      const items = props.items.filter((item) => item.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    }, {});

    return (
      <div
        role="listbox"
        aria-label="Slash commands"
        className="bg-background border border-border rounded-md shadow-xl p-1 w-64 max-h-96 overflow-y-auto"
      >
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} role="group" aria-label={category}>
            <p className="px-2 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {category}
            </p>
            {items.map((item) => {
              const globalIdx = props.items.indexOf(item);
              return (
                <button
                  key={item.title}
                  role="option"
                  aria-selected={globalIdx === selectedIndex}
                  aria-label={`${item.title}: ${item.description}`}
                  onClick={() => selectItem(item)}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-sm text-left transition-colors ${
                    globalIdx === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="w-7 h-7 flex items-center justify-center shrink-0 border border-border rounded-sm bg-background">
                    <item.Icon className={`w-3.5 h-3.5 ${item.iconColor ?? ""}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                  {item.subpanel && (
                    <span className="text-[10px] text-muted-foreground shrink-0" aria-hidden="true">›</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);
SlashMenu.displayName = "SlashMenu";

// ── Extension ─────────────────────────────────────────────────────────────────

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
        items: ({ query }: { query: string }): CommandItem[] =>
          SLASH_COMMANDS.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
          ),
        render: () => {
          let renderer: ReactRenderer<SlashMenuRef>;
          let popup: Instance;

          return {
            onStart(props: SuggestionProps<CommandItem>) {
              renderer = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: renderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                arrow: false,
                offset: [0, 8],
                zIndex: 9999,
                animation: false,
              }) as unknown as Instance;
            },

            onUpdate(props: SuggestionProps<CommandItem>) {
              renderer.updateProps(props);
              if (props.clientRect) {
                popup?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              }
            },

            onKeyDown(props: SuggestionKeyDownProps): boolean {
              if (props.event.key === "Escape") {
                popup?.hide();
                return true;
              }
              return renderer.ref?.onKeyDown(props.event) ?? false;
            },

            onExit() {
              popup?.destroy();
              renderer.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
