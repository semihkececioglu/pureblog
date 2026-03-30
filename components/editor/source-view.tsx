"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { Code2, FileText, Copy, Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Mode = "html" | "markdown";

interface SourceViewProps {
  editor: Editor;
  onClose: () => void;
}

export function SourceView({ editor, onClose }: SourceViewProps) {
  const [mode, setMode] = useState<Mode>("html");
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load content whenever mode changes or editor updates
  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function loadContent() {
    if (mode === "html") {
      setValue(formatHTML(editor.getHTML()));
    } else {
      const { default: TurndownService } = await import("turndown");
      const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
      setValue(td.turndown(editor.getHTML()));
    }
    setDirty(false);
  }

  async function applyToEditor() {
    if (mode === "html") {
      editor.chain().focus().setContent(value).run();
    } else {
      const { marked } = await import("marked");
      const html = await marked(value) as string;
      editor.chain().focus().setContent(html).run();
    }
    setDirty(false);
    toast.success("Content updated.");
  }

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleChange(v: string) {
    setValue(v);
    setDirty(true);
  }

  return (
    <div className="border-t border-border/60 flex flex-col">
      {/* Toolbar row */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 border-b border-border/40 flex-wrap">
        {/* Mode toggle */}
        <div className="flex items-center rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => { setMode("html"); setDirty(false); }}
            className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
              mode === "html" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Code2 className="w-3 h-3" /> HTML
          </button>
          <button
            type="button"
            onClick={() => { setMode("markdown"); setDirty(false); }}
            className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
              mode === "markdown" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileText className="w-3 h-3" /> Markdown
          </button>
        </div>

        {dirty && (
          <span className="text-[10px] text-amber-500 font-medium">Unsaved changes</span>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Refresh from editor */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={loadContent}
            title="Reload from editor"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>

          {/* Copy */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </Button>

          {/* Apply */}
          <Button
            type="button"
            size="sm"
            className="h-7 px-3 text-xs gap-1"
            onClick={applyToEditor}
            disabled={!dirty}
          >
            Apply
          </Button>

          {/* Close */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className="w-full font-mono text-xs leading-relaxed p-3 bg-background focus:outline-none resize-y min-h-48 max-h-96"
        placeholder={mode === "html" ? "<p>HTML content…</p>" : "# Markdown content…"}
      />
    </div>
  );
}

// Pretty-print HTML with basic indentation
function formatHTML(html: string): string {
  let indent = 0;
  const tab = "  ";
  return html
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^<\//.test(trimmed)) indent = Math.max(0, indent - 1);
      const result = tab.repeat(indent) + trimmed;
      if (/^<[^/!][^>]*[^/]>$/.test(trimmed) && !/^<(br|hr|img|input|meta|link)/.test(trimmed)) {
        indent++;
      }
      return result;
    })
    .filter(Boolean)
    .join("\n");
}
