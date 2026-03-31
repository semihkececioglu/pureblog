"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSound } from "@/hooks/use-sound";
import { switch005Sound } from "@/lib/switch-005";
import { switch006Sound } from "@/lib/switch-006";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ThemeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="theme-left">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
        <clipPath id="theme-right">
          <rect x="12" y="0" width="12" height="24" />
        </clipPath>
        <pattern
          id="theme-stripes"
          patternUnits="userSpaceOnUse"
          width="3"
          height="3"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      {/* Left half: solid fill */}
      <circle cx="12" cy="12" r="9" fill="currentColor" clipPath="url(#theme-left)" />
      {/* Right half: diagonal stripes */}
      <circle cx="12" cy="12" r="9" fill="url(#theme-stripes)" clipPath="url(#theme-right)" />
      {/* Circle border */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [playOn] = useSound(switch005Sound, { volume: 0.5 });
  const [playOff] = useSound(switch006Sound, { volume: 0.5 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <ThemeIcon />
      </Button>
    );
  }

  const toggle = () => {
    if (resolvedTheme === "dark") {
      playOff();
      setTheme("light");
    } else {
      playOn();
      setTheme("dark");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggle}
            />
          }
        >
          <ThemeIcon />
        </TooltipTrigger>
        <TooltipContent side="bottom">Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
