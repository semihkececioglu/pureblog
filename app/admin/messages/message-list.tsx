"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IMessage } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MailOpen, Trash2, Reply, ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MessageRow = IMessage & { _id: string };
type ReadFilter = "all" | "unread" | "read";

const PAGE_SIZE = 15;

interface MessageListProps {
  initialMessages: MessageRow[];
  totalCount: number;
}

export function MessageList({ initialMessages, totalCount }: MessageListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState(initialMessages);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [drawerMessage, setDrawerMessage] = useState<MessageRow | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Read state from URL
  const search = searchParams.get("q") ?? "";
  const readFilter = (searchParams.get("read") ?? "all") as ReadFilter;
  const page = Number(searchParams.get("page") ?? "1");

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === "all" || v === "1") params.delete(k);
        else params.set(k, v);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  async function markAsRead(id: string): Promise<void> {
    const res = await fetch(`/api/admin/messages/${id}/read`, { method: "PATCH" });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
      toast.success("Marked as read.");
    } else {
      toast.error("Failed to mark as read.");
    }
  }

  async function handleReply(): Promise<void> {
    if (!replyId || !replyBody.trim()) return;
    setReplying(true);
    const res = await fetch(`/api/admin/messages/${replyId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody }),
    });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m._id === replyId ? { ...m, read: true } : m)));
      setReplyId(null);
      setReplyBody("");
      toast.success("Reply sent.");
    } else {
      toast.error("Failed to send reply.");
    }
    setReplying(false);
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m._id !== deleteId));
      if (expanded === deleteId) setExpanded(null);
      setDeleteId(null);
      router.refresh();
      toast.success("Message deleted.");
    } else {
      setDeleteId(null);
      toast.error("Failed to delete message.");
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filterLabels: { key: ReadFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, or subject..."
          defaultValue={search}
          onChange={(e) => setParams({ q: e.target.value, page: "1" })}
          className="max-w-xs"
        />
        <div className="flex items-center gap-1">
          {filterLabels.map(({ key, label }) => (
            <Button
              key={key}
              variant={readFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setParams({ read: key, page: "1" })}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`border p-4 transition-colors ${
                message.read ? "border-border" : "border-foreground"
              }`}
            >
              <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setExpanded(expanded === message._id ? null : message._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">{message.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{message.email}</span>
                    {!message.read && (
                      <span className="font-mono text-xs text-foreground uppercase tracking-widest">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{message.subject}</p>
                </div>
                <div
                  className="flex items-center gap-1 shrink-0 text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  {expanded === message._id
                    ? <ChevronUp width={14} height={14} />
                    : <ChevronDown width={14} height={14} />
                  }

                  {/* Desktop: dropdown */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                        <MoreHorizontal width={14} height={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setReplyId(message._id); setReplyBody(""); }}>
                          <Reply width={14} height={14} /> Reply
                        </DropdownMenuItem>
                        {!message.read && (
                          <DropdownMenuItem onClick={() => markAsRead(message._id)}>
                            <MailOpen width={14} height={14} /> Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(message._id)}>
                          <Trash2 width={14} height={14} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile: opens action drawer */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0"
                    aria-label="Actions"
                    onClick={() => setDrawerMessage(message)}
                  >
                    <MoreHorizontal width={18} height={18} />
                  </Button>
                </div>
              </div>
              {expanded === message._id && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setParams({ page: String(page - 1) })}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft width={16} height={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setParams({ page: String(page + 1) })}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight width={16} height={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile: action drawer */}
      <Sheet open={!!drawerMessage} onOpenChange={(open) => { if (!open) setDrawerMessage(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">{drawerMessage?.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => { setReplyId(drawerMessage!._id); setReplyBody(""); setDrawerMessage(null); }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <Reply width={16} height={16} /> Reply
            </button>
            {!drawerMessage?.read && (
              <button
                onClick={() => { markAsRead(drawerMessage!._id); setDrawerMessage(null); }}
                className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
              >
                <MailOpen width={16} height={16} /> Mark as read
              </button>
            )}
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerMessage!._id); setDrawerMessage(null); }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!replyId} onOpenChange={(open: boolean) => { if (!open) { setReplyId(null); setReplyBody(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              {replyId && (() => {
                const msg = messages.find((m) => m._id === replyId);
                return msg ? `Replying to ${msg.name} (${msg.email})` : null;
              })()}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your reply..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReplyId(null); setReplyBody(""); }}>Cancel</Button>
            <Button onClick={handleReply} disabled={replying || !replyBody.trim()}>
              {replying ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The message will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
