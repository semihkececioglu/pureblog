"use client";

import { useEffect, useRef, ReactNode, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Mobile detection ──────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ── Portal dropdown panel (desktop) ──────────────────────────────────────────

interface PortalPanelProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  width: string;
  align: "left" | "right";
}

function PortalPanel({ anchorRef, onClose, children, width, align }: PortalPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  // Position relative to anchor
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: align === "right" ? undefined : rect.left,
      right: align === "right" ? window.innerWidth - rect.right : undefined,
    });
  }, [anchorRef, align]);

  // Close on outside mousedown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Slight delay so the open-click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [anchorRef, onClose]);

  // Reposition on scroll/resize
  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: align === "right" ? undefined : rect.left,
        right: align === "right" ? window.innerWidth - rect.right : undefined,
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, align]);

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={cn(
        "z-[200] bg-background border border-border rounded-md shadow-lg py-1 max-h-[80vh] overflow-y-auto",
        width
      )}
    >
      {children}
    </div>,
    document.body
  );
}

// ── ToolbarDropdown ───────────────────────────────────────────────────────────

interface ToolbarDropdownProps {
  icon?: LucideIcon;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
  align?: "left" | "right";
  width?: string;
  drawerTitle?: string;
}

export function ToolbarDropdown({
  icon: Icon,
  label,
  active,
  disabled,
  isOpen,
  onToggle,
  onClose,
  children,
  align = "left",
  width = "w-48",
  drawerTitle,
}: ToolbarDropdownProps) {
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1 h-7 px-2 rounded text-sm transition-colors shrink-0",
        active || isOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label && <span className="text-xs font-medium">{label}</span>}
      <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
    </button>
  );

  // Mobile: bottom sheet drawer
  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent side="bottom" showCloseButton className="max-h-[80vh] overflow-y-auto pb-safe rounded-t-xl">
            {drawerTitle && (
              <SheetHeader className="pb-2">
                <SheetTitle className="text-sm">{drawerTitle}</SheetTitle>
              </SheetHeader>
            )}
            <div className="py-2">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: portal dropdown
  return (
    <>
      {trigger}
      {isOpen && (
        <PortalPanel
          anchorRef={triggerRef}
          onClose={onClose}
          width={width}
          align={align}
        >
          {children}
        </PortalPanel>
      )}
    </>
  );
}

// ── Menu Item helpers ─────────────────────────────────────────────────────────

interface DropdownItemProps {
  icon?: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  iconClassName?: string;
  className?: string;
}

export function DropdownItem({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
  iconClassName,
  className,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-muted rounded-sm mx-1",
        active && "bg-muted font-medium",
        className
      )}
      style={{ width: "calc(100% - 8px)" }}
    >
      {Icon && <Icon className={cn("w-4 h-4 shrink-0", iconClassName)} />}
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-muted-foreground font-mono">{shortcut}</span>
      )}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-border" />;
}
