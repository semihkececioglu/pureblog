"use client";

import { useState } from "react";
import { ThumbsUp, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { type: "like", icon: <ThumbsUp width={16} height={16} />, label: "Like" },
  { type: "heart", icon: <Heart width={16} height={16} />, label: "Heart" },
  { type: "fire", icon: <Flame width={16} height={16} />, label: "Fire" },
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
    <div className="flex items-center gap-2 mt-12 pt-8 border-t border-border">
      {reactions.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          aria-label={label}
          disabled={reacted !== null}
          onClick={() => handleReaction(type)}
          className={reacted === type ? "border-foreground" : ""}
        >
          {icon}
          <span className="font-mono text-xs ml-1">{counts[type]}</span>
        </Button>
      ))}
    </div>
  );
}
