"use client";

import { useTheme } from "next-themes";
import { LightRays } from "@/components/ui/light-rays";

export function LogoCircle() {
  const { resolvedTheme } = useTheme();
  const color =
    resolvedTheme === "dark"
      ? "rgba(200, 165, 110, 0.7)"
      : "rgba(140, 100, 50, 0.5)";

  return (
    <div className="relative shrink-0 w-28 h-28 flex items-center justify-center">
      {/* LightRays extends beyond the circle */}
      <div
        className="absolute overflow-hidden"
        style={{
          inset: "-2rem",
          maskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 70%)",
        }}
      >
        <LightRays color={color} length="130px" blur={35} count={4} />
      </div>
      {/* Circle on top */}
      <div className="relative z-10 w-full h-full rounded-full bg-black flex items-center justify-center">
        <span className="font-sans text-3xl font-bold tracking-tight text-white">pb</span>
      </div>
    </div>
  );
}
