"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import confetti from "canvas-confetti";
import { useSound } from "@/hooks/use-sound";
import { metalLatchSound } from "@/lib/metal-latch";
import { error007Sound } from "@/lib/error-007";

const MAX_LIKES = 3;

const HEART_PATH =
  "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z";

function fireHeartConfetti(originX: number, originY: number) {
  const heart = confetti.shapeFromPath({ path: HEART_PATH });
  confetti({
    particleCount: 20,
    spread: 50,
    origin: { x: originX, y: originY },
    shapes: [heart],
    colors: ["#f43f5e", "#fb7185", "#fda4af", "#ff6b8a", "#e11d48"],
    scalar: 0.9,
    startVelocity: 18,
    gravity: 0.8,
  });
}

function HeartIcon({ fillLevel }: { fillLevel: 0 | 1 | 2 | 3 }) {
  const fillPercent = (fillLevel / MAX_LIKES) * 100;

  return (
    <svg viewBox="0 0 24 24" width={20} height={20}>
      <defs>
        <clipPath id="heart-clip">
          <rect x="0" y={24 - (24 * fillPercent) / 100} width="24" height="24" />
        </clipPath>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="currentColor"
        className="text-rose-500"
        clipPath="url(#heart-clip)"
      />
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={fillLevel === MAX_LIKES ? "text-rose-500" : "text-muted-foreground"}
      />
    </svg>
  );
}

interface ReactionBarProps {
  slug: string;
  initialReactions: { like: number; heart: number; fire: number };
}

export function ReactionBar({ slug, initialReactions }: ReactionBarProps) {
  const [count, setCount] = useState(initialReactions.heart);
  const [pressed, setPressed] = useState(0);
  const pendingRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [playLatch] = useSound(metalLatchSound, { volume: 0.5 });
  const [playError] = useSound(error007Sound, { volume: 0.4 });

  const handleLike = useCallback(async () => {
    if (pressed >= MAX_LIKES) {
      playError();
      toast("Maximum 3 likes per post.");
      return;
    }
    if (pendingRef.current) return;
    pendingRef.current = true;
    playLatch();

    const next = pressed + 1;
    setPressed(next);
    setCount((c) => c + 1);

    if (next === MAX_LIKES && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      fireHeartConfetti(x, y);
    }

    await fetch(`/api/posts/${slug}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "heart" }),
    });

    pendingRef.current = false;
  }, [pressed, slug, playLatch, playError]);

  return (
    <motion.button
      ref={btnRef}
      onClick={handleLike}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      aria-label="Like"
      className="inline-flex items-center gap-0 border border-border rounded-full overflow-hidden cursor-pointer select-none hover:bg-muted transition-colors"
    >
      {/* Like + icon */}
      <span className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
        <HeartIcon fillLevel={pressed as 0 | 1 | 2 | 3} />
        <span className="font-sans text-base font-semibold">Like</span>
      </span>
      {/* Divider */}
      <span className="w-px h-5 bg-border" />
      {/* Count */}
      <span className="flex items-center px-4 py-2 font-sans text-sm font-medium text-muted-foreground min-w-[2.5rem] justify-center">
        <SlidingNumber value={count} />
      </span>
    </motion.button>
  );
}
