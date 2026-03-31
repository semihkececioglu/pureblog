"use client";

import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextTopLoader color="currentColor" shadow={false} showSpinner={false} height={2} />
      {children}
      <Toaster position="bottom-center" swipeDirections={["bottom", "left", "right"]} />
    </ThemeProvider>
  );
}
