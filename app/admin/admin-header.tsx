"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Menu, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminSidebarMobile } from "./admin-sidebar";
import { signOutAction } from "./actions";

export function AdminHeader({
  userName,
  pendingComments,
  unreadMessages,
}: {
  userName?: string | null;
  pendingComments: number;
  unreadMessages: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AdminSidebarMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        pendingComments={pendingComments}
        unreadMessages={unreadMessages}
      />
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu width={20} height={20} />
          </Button>
          <p className="text-sm text-muted-foreground">
            Welcome,{" "}
            <span className="text-foreground font-medium">{userName}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/" target="_blank" className={buttonVariants({ variant: "ghost", size: "default" }) + " flex items-center gap-2"}>
            <ExternalLink width={16} height={16} />
            <span className="hidden sm:inline">View Blog</span>
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" size="default" type="submit" aria-label="Sign out">
              <LogOut width={16} height={16} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </header>
    </>
  );
}
