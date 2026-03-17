"use client";

import { useTheme } from "next-themes";
import { LightRays } from "@/components/ui/light-rays";

export function ThemedLightRays() {
  const { resolvedTheme } = useTheme();
  const color =
    resolvedTheme === "dark"
      ? "rgba(200, 165, 110, 0.5)"   // warm golden
      : "rgba(140, 100, 50, 0.3)";   // warm brown

  return <LightRays color={color} length="260px" blur={60} count={5} />;
}
