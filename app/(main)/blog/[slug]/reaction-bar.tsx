"use client";

import { useState } from "react";
import { ThumbsUp, Heart, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionBarProps {
  slug: string;
  initialReactions: {
    like: number;
    heart: number;
    fire: number;
  };
}

type ReactionType = "like" | "heart" | "fire";

const reactions: {
  type: ReactionType;
  icon: React.ReactNode;
  label: string;
}[] = [
  { type: "like", icon: <ThumbsUp width={15} height={15} />, label: "Like" },
  { type: "heart", icon: <Heart width={15} height={15} />, label: "Heart" },
  { type: "fire", icon: <Flame width={15} height={15} />, label: "Fire" },
];

export function ReactionBar({ slug, initialReactions }: ReactionBarProps) {
  const [counts, setCounts] = useState(initialReactions);
  const [reacted, setReacted] = useState<ReactionType | null>(null);

  async function handleReaction(type: ReactionType): Promise<void> {
    if (reacted === type) return;

    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setReacted(type);

    await fetch(`/api/posts/${slug}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
  }

  return (
    <div className="flex items-center gap-3 mt-10 pt-8 border-t border-border">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest mr-1">
        React
      </span>
      {reactions.map(({ type, icon, label }) => (
        <button
          key={type}
          aria-label={label}
          disabled={reacted !== null}
          onClick={() => handleReaction(type)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs transition-colors",
            reacted === type
              ? "bg-foreground text-background"
              : "bg-muted hover:bg-muted-foreground/20",
            reacted !== null && reacted !== type
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer"
          )}
        >
          {icon}
          <span>{counts[type]}</span>
        </button>
      ))}
    </div>
  );
}
