"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Menu } from "lucide-react";
import { AdminSidebarMobile } from "./admin-sidebar";
import { signOutAction } from "./actions";

export function AdminHeader({ userName }: { userName?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AdminSidebarMobile open={mobileOpen} onOpenChange={setMobileOpen} />
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
