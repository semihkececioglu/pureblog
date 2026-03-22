import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextTopLoader color="currentColor" shadow={false} showSpinner={false} height={2} />
      {children}
      <Toaster position="bottom-center" swipeDirections={["bottom", "left", "right"]} />
    </ThemeProvider>
  );
}
