import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Bookmarks",
  description: "Your saved posts.",
  path: "/bookmarks",
});

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
