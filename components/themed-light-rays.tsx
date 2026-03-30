"use client";

import { LightRays } from "@/components/ui/light-rays";

export function ThemedLightRays() {
  // Color is handled via CSS variables in globals.css to avoid SSR/client mismatch
  return <LightRays color="var(--hero-ray-color)" length="260px" blur={60} count={5} />;
}
