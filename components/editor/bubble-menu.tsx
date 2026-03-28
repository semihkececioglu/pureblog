"use client";

import { useState, useRef, useEffect } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  Link,
  ExternalLink,
  Pencil,
  Unlink,
  Superscript,
  Subscript,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [linkEditMode, setLinkEditMode] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const isInLink = editor.isActive("link");

  useEffect(() => {
    if (linkEditMode) {
      setLinkValue(editor.getAttributes("link").href ?? "");
      setTimeout(() => linkInputRef.current?.focus(), 50);
    }
  }, [linkEditMode, editor]);

  // Reset link edit mode when selection changes
  useEffect(() => {
    setLinkEditMode(false);
  }, [editor.state.selection]);

  function applyLink() {
    if (linkValue) {
      editor.chain().focus().setLink({ href: linkValue }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkEditMode(false);
  }

  const formattingTools = [
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
    {
      icon: Code,
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    {
      icon: Superscript,
      label: "Superscript",
      action: () => editor.chain().focus().toggleSuperscript().run(),
      active: editor.isActive("superscript"),
    },
    {
      icon: Subscript,
      label: "Subscript",
      action: () => editor.chain().focus().toggleSubscript().run(),
      active: editor.isActive("subscript"),
    },
  ];

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top-start",
        offset: 8,
      }}
      shouldShow={({ editor: ed, state }) => {
        const { empty } = state.selection;
        if (ed.isActive("codeBlock")) return false;
        if (ed.isActive("image")) return false;
        if (ed.isActive("youtube")) return false;
        if (isInLink) return true;
        return !empty;
      }}
    >
      <div className="bg-background border border-border shadow-lg rounded-md overflow-hidden flex items-stretch">
        {/* Link popover mode */}
        {isInLink && !linkEditMode ? (
          <>
            <a
              href={editor.getAttributes("link").href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[160px] truncate"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{editor.getAttributes("link").href}</span>
            </a>
            <div className="w-px bg-border" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setLinkEditMode(true); }}
              className="p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Edit link"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetLink().run(); }}
              className="p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
              title="Remove link"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </>
        ) : isInLink && linkEditMode ? (
          <div className="flex items-center gap-1 p-1">
            <Input
              ref={linkInputRef}
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://..."
              className="h-6 text-xs w-52"
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); applyLink(); }
                if (e.key === "Escape") setLinkEditMode(false);
              }}
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
              className="text-xs px-2 py-1 bg-foreground text-background rounded shrink-0"
            >
              Apply
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); setLinkEditMode(false); }}
              className="text-xs p-1 hover:bg-muted rounded text-muted-foreground shrink-0"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Formatting tools */
          <>
            {formattingTools.map(({ icon: Icon, label, action, active }, i) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); action(); }}
                title={label}
                className={`p-1.5 transition-colors ${
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${i > 0 ? "border-l border-border/50" : ""}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
            <div className="w-px bg-border" />
            {/* Link toggle */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setLinkEditMode(true);
              }}
              title="Add link"
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
