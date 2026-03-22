"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  Mail,
  Users,
  Settings,
  BookOpen,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/series", label: "Series", icon: BookOpen },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarNavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-4">
      <ul className="flex flex-col gap-1 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon width={16} height={16} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminSidebarDesktop() {
  return (
    <aside className="hidden md:flex w-56 border-r border-border flex-col shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-border">
        <Link
          href="/"
          className="font-serif text-base font-bold tracking-tight"
        >
          PureBlog
        </Link>
      </div>
      <SidebarNavContent />
    </aside>
  );
}

export function AdminSidebarMobile({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="h-14 border-b border-border px-4 flex justify-center">
          <SheetTitle className="text-left">
            <Link href="/" className="font-serif text-base font-bold tracking-tight">
              PureBlog
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNavContent onNavClick={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
