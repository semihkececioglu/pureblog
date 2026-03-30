"use client";

import { X, Monitor, Smartphone, Tablet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PostPreviewData {
  title?: string;
  excerpt?: string;
  coverImage?: string;
  categoryName?: string;
  tags?: string[];
  readingTime?: number;
}

interface PostPreviewProps {
  content: string;
  data: PostPreviewData;
  onClose: () => void;
}

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "max-w-2xl",
  tablet: "max-w-lg",
  mobile: "max-w-sm",
};

export function PostPreview({ content, data, onClose }: PostPreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="fixed inset-0 z-[300] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Preview mode
        </div>

        {/* Device toggle */}
        <div className="flex items-center rounded-md border border-border overflow-hidden text-xs ml-4">
          {(
            [
              { id: "desktop" as Device, Icon: Monitor, label: "Desktop" },
              { id: "tablet" as Device, Icon: Tablet, label: "Tablet" },
              { id: "mobile" as Device, Icon: Smartphone, label: "Mobile" },
            ] as const
          ).map(({ id, Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setDevice(id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 transition-colors",
                device === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
            Close preview
          </Button>
        </div>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 overflow-auto bg-muted/20 py-8 px-4">
        <div
          className={cn(
            "mx-auto w-full transition-all duration-300 bg-background rounded-xl border border-border shadow-sm",
            DEVICE_WIDTHS[device]
          )}
        >
          <article className="px-6 md:px-8 pt-8 pb-12">
            {/* Header */}
            <header className="mb-8">
              {data.categoryName && (
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  {data.categoryName}
                </p>
              )}
              {data.title ? (
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
                  {data.title}
                </h1>
              ) : (
                <div className="h-10 w-3/4 rounded bg-muted animate-pulse mb-4" />
              )}
              {data.excerpt && (
                <p className="text-muted-foreground text-lg leading-snug">
                  {data.excerpt}
                </p>
              )}
            </header>

            {/* Meta bar */}
            <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-border mb-8 text-sm">
              {data.categoryName && (
                <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40 border-r border-border">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Category</span>
                  <span className="font-medium">{data.categoryName}</span>
                </div>
              )}
              <div className="flex flex-col gap-1 px-4 py-3 bg-muted/40">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Reading Time</span>
                <span className="font-medium">{data.readingTime ?? 1} min</span>
              </div>
            </div>

            {/* Cover image */}
            {data.coverImage && (
              <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.coverImage}
                  alt={data.title ?? "Cover image"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            {content ? (
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`h-4 rounded bg-muted animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground bg-muted/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
