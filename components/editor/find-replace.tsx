"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/core";
import type { Mark } from "@tiptap/pm/model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FindReplaceProps {
  editor: Editor;
  onClose: () => void;
}

function replaceAll(
  editor: Editor,
  searchTerm: string,
  replaceTerm: string,
  caseSensitive: boolean
): number {
  if (!searchTerm) return 0;

  const { state, dispatch } = editor.view;
  const { doc, schema, tr } = state;
  const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";

  type Replacement = {
    from: number;
    to: number;
    text: string;
    marks: readonly Mark[];
  };
  const replacements: Replacement[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const re = new RegExp(safeSearch, flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(node.text)) !== null) {
      replacements.push({
        from: pos + match.index,
        to: pos + match.index + match[0].length,
        text: replaceTerm,
        marks: node.marks,
      });
    }
  });

  if (!replacements.length) return 0;

  // Apply in reverse order so earlier positions stay valid
  for (const { from, to, text, marks } of [...replacements].reverse()) {
    if (text) {
      tr.replaceWith(from, to, schema.text(text, marks as Mark[]));
    } else {
      tr.delete(from, to);
    }
  }

  dispatch(tr);
  return replacements.length;
}

function countMatches(
  editor: Editor,
  searchTerm: string,
  caseSensitive: boolean
): number {
  if (!searchTerm) return 0;
  const text = editor.getText();
  const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const re = new RegExp(safeSearch, caseSensitive ? "g" : "gi");
    return (text.match(re) ?? []).length;
  } catch {
    return 0;
  }
}

export function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const [replaced, setReplaced] = useState<number | null>(null);

  useEffect(() => {
    setLastCount(countMatches(editor, search, caseSensitive));
    setReplaced(null);
  }, [search, caseSensitive, editor]);

  function handleReplaceAll() {
    const n = replaceAll(editor, search, replace, caseSensitive);
    setReplaced(n);
    setLastCount(0);
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/20 flex-wrap">
      <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap gap-y-1.5">
        {/* Search */}
        <div className="flex items-center gap-1.5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find…"
            className="h-7 text-sm w-36"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") handleReplaceAll();
            }}
          />
          <span className="text-[11px] text-muted-foreground shrink-0 w-16">
            {search
              ? replaced !== null
                ? `Replaced ${replaced}`
                : `${lastCount} found`
              : ""}
          </span>
        </div>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Replace */}
        <div className="flex items-center gap-1.5">
          <Input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replace with…"
            className="h-7 text-sm w-36"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") handleReplaceAll();
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs shrink-0"
            onClick={handleReplaceAll}
            disabled={!search || lastCount === 0}
          >
            Replace all
          </Button>
        </div>

        {/* Case toggle */}
        <button
          type="button"
          onClick={() => setCaseSensitive((v) => !v)}
          title="Case sensitive (Aa)"
          className={`font-mono text-[11px] border rounded px-1 py-0.5 shrink-0 transition-colors ${
            caseSensitive
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:border-foreground"
          }`}
        >
          Aa
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground shrink-0"
        title="Close (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
