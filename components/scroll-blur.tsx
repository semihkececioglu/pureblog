"use client";

import { useEffect, useState } from "react";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

interface ScrollBlurProps {
  fadeDistance?: number;
  height?: string;
  blurLevels?: number[];
  className?: string;
}

export function ScrollBlur({ fadeDistance = 80, height = "120px", blurLevels, className }: ScrollBlurProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setOpacity(0);
        return;
      }
      const remaining = total - scrolled;
      setOpacity(Math.min(1, remaining / fadeDistance));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [fadeDistance]);

  if (opacity === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40"
      style={{ opacity }}
    >
      <ProgressiveBlur position="bottom" height={height} blurLevels={blurLevels} className={className} />
    </div>
  );
}
