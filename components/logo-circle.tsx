"use client";

import { LightRays } from "@/components/ui/light-rays";

export function LogoCircle() {
  // Color is handled via CSS variables in globals.css to avoid SSR/client mismatch
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
        <LightRays color="var(--logo-ray-color)" length="130px" blur={35} count={4} />
      </div>
      {/* Circle on top */}
      <div className="relative z-10 w-full h-full rounded-full bg-black flex items-center justify-center">
        <span className="font-sans text-3xl font-bold tracking-tight text-white">pb</span>
      </div>
    </div>
  );
}
