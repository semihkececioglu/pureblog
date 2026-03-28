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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CommandItem {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconColor?: string;
  command: (args: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    Icon: Pilcrow,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    Icon: Heading1,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    Icon: Heading2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    Icon: Heading3,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Simple unordered list",
    Icon: List,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list with numbers",
    Icon: ListOrdered,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Todo list with checkboxes",
    Icon: CheckSquare,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Blockquote callout",
    Icon: Quote,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Code with syntax highlighting",
    Icon: Code2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Insert a 3×3 table",
    Icon: Table,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    Icon: Minus,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  // Callouts
  {
    title: "Info",
    description: "Blue info callout box",
    Icon: Info,
    iconColor: "text-blue-500",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("info").run(),
  },
  {
    title: "Warning",
    description: "Yellow warning callout box",
    Icon: AlertTriangle,
    iconColor: "text-amber-500",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("warning").run(),
  },
  {
    title: "Tip",
    description: "Green tip callout box",
    Icon: Lightbulb,
    iconColor: "text-emerald-500",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("tip").run(),
  },
  {
    title: "Danger",
    description: "Red danger callout box",
    Icon: ShieldAlert,
    iconColor: "text-red-500",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("danger").run(),
  },
];

// ── Slash Menu UI ─────────────────────────────────────────────────────────────

interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashMenu = forwardRef<SlashMenuRef, SuggestionProps<CommandItem>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown(event: KeyboardEvent): boolean {
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
          if (item) props.command(item);
          return true;
        }
        return false;
      },
    }));

    if (!props.items.length) return null;

    return (
      <div className="bg-background border border-border rounded-md shadow-xl p-1 w-64 max-h-80 overflow-y-auto">
        <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Blocks
        </p>
        {props.items.map((item, i) => (
          <button
            key={item.title}
            onClick={() => props.command(item)}
            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-sm text-left transition-colors ${
              i === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center shrink-0 border border-border rounded-sm bg-background">
              <item.Icon className={`w-4 h-4 ${item.iconColor ?? ""}`} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {item.description}
              </p>
            </div>
          </button>
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
            item.title.toLowerCase().includes(query.toLowerCase())
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
