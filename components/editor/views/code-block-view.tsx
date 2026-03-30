"use client";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CodeBlockView({
  node,
}: {
  node: { attrs: { language?: string }; textContent: string };
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(node.textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <NodeViewWrapper className="relative group my-4">
      {node.attrs.language && (
        <div className="absolute top-2 left-3 text-[10px] font-mono text-muted-foreground pointer-events-none select-none z-10">
          {node.attrs.language}
        </div>
      )}
      <button
        type="button"
        onClick={copyCode}
        contentEditable={false}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-muted hover:bg-border rounded p-1"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
      <pre className="!mt-0 !mb-0">
        {/* NodeViewContent renders the editable code content */}
        <NodeViewContent as={"code" as "div"} />
      </pre>
    </NodeViewWrapper>
  );
}
