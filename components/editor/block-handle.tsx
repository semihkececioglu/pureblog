"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Editor } from "@tiptap/core";
import { GripVertical, Plus } from "lucide-react";

interface BlockHandleProps {
  editor: Editor;
}

interface HandleState {
  top: number;
  left: number;
  nodePos: number;
  nodeSize: number;
}

interface DropIndicator {
  top: number;
  left: number;
  width: number;
}

export function BlockHandle({ editor }: BlockHandleProps) {
  const [handle, setHandle] = useState<HandleState | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const dragSourcePos = useRef<number | null>(null);
  const dragSourceSize = useRef<number>(0);
  const isDragging = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find the top-level block node at a given document position
  function getTopLevelNodeAt(pos: number) {
    const { doc } = editor.state;
    let nodePos = 0;
    let found: { pos: number; size: number } | null = null;
    doc.forEach((node, offset) => {
      if (offset <= pos && offset + node.nodeSize > pos) {
        found = { pos: offset, size: node.nodeSize };
      }
      if (found === null) nodePos = offset;
    });
    return found;
  }

  // Find the top-level block node nearest to a clientY coordinate
  function getNodeAtClientY(clientY: number) {
    const editorEl = editor.view.dom as HTMLElement;
    const editorRect = editorEl.getBoundingClientRect();
    if (clientY < editorRect.top || clientY > editorRect.bottom) return null;

    // Walk top-level children
    const children = Array.from(editorEl.children) as HTMLElement[];
    let best: { el: HTMLElement; pos: number; size: number } | null = null;
    let bestDist = Infinity;

    const { doc } = editor.state;
    let childIndex = 0;
    doc.forEach((node, offset) => {
      const el = children[childIndex];
      childIndex++;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - midY);
      if (dist < bestDist) {
        bestDist = dist;
        best = { el, pos: offset, size: node.nodeSize };
      }
    });

    return best;
  }

  // Get insertion point (before or after a node based on mouse position)
  function getDropPosition(clientY: number): { pos: number; rect: DOMRect; before: boolean } | null {
    const editorEl = editor.view.dom as HTMLElement;
    const children = Array.from(editorEl.children) as HTMLElement[];
    const { doc } = editor.state;
    let childIndex = 0;
    let result: { pos: number; rect: DOMRect; before: boolean } | null = null;
    let bestDist = Infinity;

    doc.forEach((node, offset) => {
      const el = children[childIndex];
      childIndex++;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const before = clientY < midY;
      const dist = Math.abs(clientY - midY);
      if (dist < bestDist) {
        bestDist = dist;
        result = { pos: offset, rect, before };
      }
    });
    return result;
  }

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isDragging.current) setHandle(null);
    }, 300);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const editorEl = editor.view.dom as HTMLElement;

    function onMouseMove(e: MouseEvent) {
      if (isDragging.current) return;
      cancelHide();

      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;

      // Find the top-level block element
      const topChild = findTopLevelChild(editorEl, target);
      if (!topChild) {
        scheduleHide();
        return;
      }

      // Find ProseMirror pos for this element
      const { doc } = editor.state;
      const children = Array.from(editorEl.children);
      const idx = children.indexOf(topChild);
      if (idx === -1) { scheduleHide(); return; }

      let nodePos = -1;
      let nodeSize = 0;
      let i = 0;
      doc.forEach((node, offset) => {
        if (i === idx) { nodePos = offset; nodeSize = node.nodeSize; }
        i++;
      });
      if (nodePos === -1) { scheduleHide(); return; }

      const rect = topChild.getBoundingClientRect();
      setHandle({
        top: rect.top + rect.height / 2 - 10,
        left: rect.left - 52,
        nodePos,
        nodeSize,
      });
    }

    function onMouseLeave(e: MouseEvent) {
      const rel = e.relatedTarget as HTMLElement | null;
      // Don't hide if moving to the handle overlay
      if (rel?.closest?.("[data-block-handle]")) return;
      scheduleHide();
    }

    editorEl.addEventListener("mousemove", onMouseMove);
    editorEl.addEventListener("mouseleave", onMouseLeave);
    return () => {
      editorEl.removeEventListener("mousemove", onMouseMove);
      editorEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [editor, scheduleHide, cancelHide]);

  // Drag handlers
  function onDragStart(e: React.DragEvent) {
    if (!handle) return;
    isDragging.current = true;
    dragSourcePos.current = handle.nodePos;
    dragSourceSize.current = handle.nodeSize;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(handle.nodePos));

    // Create a ghost element
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-1000px;left:-1000px;width:200px;padding:4px 8px;background:var(--background);border:1px solid var(--border);border-radius:4px;font-size:12px;color:var(--muted-foreground);";
    ghost.textContent = "Moving block…";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 100, 16);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }

  function onDragEnd() {
    isDragging.current = false;
    dragSourcePos.current = null;
    setDropIndicator(null);
    setHandle(null);
  }

  // Document-level drag over / drop
  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (!isDragging.current) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";

      const drop = getDropPosition(e.clientY);
      if (!drop) { setDropIndicator(null); return; }

      const indicatorY = drop.before ? drop.rect.top : drop.rect.bottom;
      setDropIndicator({
        top: indicatorY - 1,
        left: drop.rect.left,
        width: drop.rect.width,
      });
    }

    function onDrop(e: DragEvent) {
      if (!isDragging.current || dragSourcePos.current === null) return;
      e.preventDefault();
      e.stopPropagation();

      const drop = getDropPosition(e.clientY);
      if (!drop) return;

      const { state, dispatch } = editor.view;
      const { doc } = state;
      const srcPos = dragSourcePos.current;

      // Find target insertion pos
      let targetInsertPos: number;
      if (drop.before) {
        targetInsertPos = drop.pos;
      } else {
        // after this node
        let targetSize = 0;
        doc.forEach((node, offset) => {
          if (offset === drop.pos) targetSize = node.nodeSize;
        });
        targetInsertPos = drop.pos + targetSize;
      }

      // Don't move onto itself
      if (
        targetInsertPos === srcPos ||
        targetInsertPos === srcPos + dragSourceSize.current
      ) return;

      const srcNode = doc.nodeAt(srcPos);
      if (!srcNode) return;

      const tr = state.tr;
      if (targetInsertPos > srcPos) {
        // Insert after first (so positions don't shift)
        tr.insert(targetInsertPos, srcNode);
        tr.delete(srcPos, srcPos + srcNode.nodeSize);
      } else {
        // Insert before, then delete
        tr.delete(srcPos, srcPos + srcNode.nodeSize);
        tr.insert(targetInsertPos, srcNode);
      }
      dispatch(tr.scrollIntoView());

      setDropIndicator(null);
      isDragging.current = false;
      dragSourcePos.current = null;
    }

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop, true); // capture to beat ProseMirror
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!handle) return null;

  return (
    <>
      {/* Handle overlay */}
      <div
        data-block-handle
        style={{ position: "fixed", top: handle.top, left: handle.left, zIndex: 50 }}
        className="flex items-center gap-0.5"
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      >
        {/* Plus button */}
        <button
          type="button"
          title="Add block (or type /)"
          onClick={() => {
            editor.chain().focus().setNodeSelection(handle.nodePos).run();
            // Move to end of node and insert newline
            const { state } = editor;
            const node = state.doc.nodeAt(handle.nodePos);
            if (!node) return;
            editor.chain().focus()
              .setTextSelection(handle.nodePos + node.nodeSize)
              .insertContent("/")
              .run();
          }}
          className="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-60 hover:opacity-100"
        >
          <Plus className="w-3 h-3" />
        </button>

        {/* Drag grip */}
        <div
          draggable
          title="Drag to reorder"
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Drop indicator */}
      {dropIndicator && (
        <div
          style={{
            position: "fixed",
            top: dropIndicator.top,
            left: dropIndicator.left,
            width: dropIndicator.width,
            height: 2,
            zIndex: 60,
            pointerEvents: "none",
          }}
          className="bg-primary rounded"
        />
      )}
    </>
  );
}

// Walk up the DOM to find the direct child of editorEl that contains target
function findTopLevelChild(editorEl: HTMLElement, target: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  while (el && el.parentElement !== editorEl) {
    el = el.parentElement;
  }
  if (!el || el === editorEl) return null;
  // Skip non-block elements (e.g. tooltips injected by Tiptap)
  if (el.tagName === "DIV" && el.classList.contains("tippy-box")) return null;
  return el;
}
