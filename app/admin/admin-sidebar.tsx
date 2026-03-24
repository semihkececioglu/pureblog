"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
import { FileTextIcon } from "@/components/ui/file-text";
import { FolderOpenIcon } from "@/components/ui/folder-open";
import { BookTextIcon } from "@/components/ui/book-text";
import { MessageSquareIcon } from "@/components/ui/message-square";
import { SendIcon } from "@/components/ui/send";
import { UsersIcon } from "@/components/ui/users";
import { SettingsIcon } from "@/components/ui/settings";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type AnimatedIconComponent = React.ForwardRefExoticComponent<
  {
    size?: number;
    className?: string;
  } & React.RefAttributes<AnimatedIconHandle>
>;

const navItems: { href: string; label: string; Icon: AnimatedIconComponent }[] =
  [
    {
      href: "/admin",
      label: "Dashboard",
      Icon: LayoutPanelTopIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/posts",
      label: "Posts",
      Icon: FileTextIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/categories",
      label: "Categories",
      Icon: FolderOpenIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/series",
      label: "Series",
      Icon: BookTextIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/comments",
      label: "Comments",
      Icon: MessageSquareIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      Icon: SendIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/subscribers",
      label: "Subscribers",
      Icon: UsersIcon as AnimatedIconComponent,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      Icon: SettingsIcon as AnimatedIconComponent,
    },
  ];

function AnimatedNavItem({
  href,
  label,
  Icon,
  isActive,
  onNavClick,
}: {
  href: string;
  label: string;
  Icon: AnimatedIconComponent;
  isActive: boolean;
  onNavClick?: () => void;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <li>
      <Link
        href={href}
        onClick={onNavClick}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${
          isActive
            ? "bg-muted text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Icon ref={iconRef} size={16} />
        {label}
      </Link>
    </li>
  );
}

function SidebarNavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-4">
      <ul className="flex flex-col gap-1 px-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <AnimatedNavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              isActive={isActive}
              onNavClick={onNavClick}
            />
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminSidebarDesktop() {
  return (
    <aside className="hidden md:flex w-56 border-r border-border flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
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
            <Link
              href="/"
              className="font-serif text-base font-bold tracking-tight"
            >
              PureBlog
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNavContent onNavClick={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
