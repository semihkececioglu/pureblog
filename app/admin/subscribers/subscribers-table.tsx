"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ISubscriber } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Trash2, RefreshCw, Download, ChevronLeft, ChevronRight, Send, MoreHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type SubscriberRow = ISubscriber & { _id: string };
type StatusFilter = "all" | "active" | "unsubscribed";

const PAGE_SIZE = 10;

export function SubscribersTable({
  subscribers: initialSubscribers,
  totalCount,
}: {
  subscribers: SubscriberRow[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendSubject, setSendSubject] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [drawerSub, setDrawerSub] = useState<SubscriberRow | null>(null);

  useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  const search = searchParams.get("q") ?? "";
  const statusFilter = (searchParams.get("status") ?? "all") as StatusFilter;
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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  async function handleToggleStatus(id: string): Promise<void> {
    setTogglingId(id);
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "PATCH" });
    const json = await res.json();
    if (json.data) {
      setSubscribers((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: json.data.status } : s))
      );
      toast.success(json.data.status === "active" ? "Subscriber reactivated." : "Subscriber unsubscribed.");
    } else {
      toast.error("Failed to update subscriber.");
    }
    setTogglingId(null);
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/subscribers/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s._id !== deleteId));
      setDeleteId(null);
      router.refresh();
      toast.success("Subscriber deleted.");
    } else {
      setDeleteId(null);
      toast.error("Failed to delete subscriber.");
    }
  }

  const activeCount = subscribers.filter((s) => s.status === "active").length;

  function handleExport() {
    window.open("/api/admin/subscribers/export", "_blank");
  }

  async function handleSendEmail(): Promise<void> {
    if (!sendSubject.trim() || !sendBody.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/subscribers/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: sendSubject, body: sendBody }),
    });
    setSending(false);
    setSendOpen(false);
    setSendSubject("");
    setSendBody("");
    if (res.ok) {
      toast.success("Email sent to subscribers.");
    } else {
      toast.error("Failed to send email.");
    }
  }

  const statusLabels: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "unsubscribed", label: "Unsubscribed" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by email..."
            defaultValue={search}
            onChange={(e) => setParams({ q: e.target.value, page: "1" })}
            className="max-w-xs"
          />
          <div className="flex items-center gap-1">
            {statusLabels.map(({ key, label }) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setParams({ status: key, page: "1" })}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="default" onClick={() => setSendOpen(true)} className="flex items-center gap-2">
            <Send width={14} height={14} />
            Send Email
          </Button>
          <Button variant="outline" size="default" onClick={handleExport} className="flex items-center gap-2">
            <Download width={14} height={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No results.</p>
        ) : (
          subscribers.map((s) => (
            <div key={s._id} className="border border-border p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs truncate">{s.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-mono text-xs uppercase tracking-widest ${
                    s.status === "active" ? "text-foreground" : "text-muted-foreground"
                  }`}>{s.status}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Actions"
                onClick={() => setDrawerSub(s)}
              >
                <MoreHorizontal width={18} height={18} />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-xs">{s.email}</TableCell>
                  <TableCell>
                    <span className={`font-mono text-xs uppercase tracking-widest ${
                      s.status === "active" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                        <MoreHorizontal width={14} height={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(s._id)}
                          disabled={togglingId === s._id}
                        >
                          <RefreshCw width={14} height={14} className={togglingId === s._id ? "animate-spin" : ""} />
                          {s.status === "active" ? "Unsubscribe" : "Reactivate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(s._id)}>
                          <Trash2 width={14} height={14} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
      <Sheet open={!!drawerSub} onOpenChange={(open) => { if (!open) setDrawerSub(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug font-mono">{drawerSub?.email}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => { handleToggleStatus(drawerSub!._id); setDrawerSub(null); }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <RefreshCw width={16} height={16} />
              {drawerSub?.status === "active" ? "Unsubscribe" : "Reactivate"}
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerSub!._id); setDrawerSub(null); }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={sendOpen} onOpenChange={(open: boolean) => { if (!open) setSendOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to Subscribers</DialogTitle>
            <DialogDescription>
              {activeCount} active subscriber{activeCount !== 1 ? "s" : ""} will receive this email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject..."
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message..."
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendEmail}
              disabled={sending || !sendSubject.trim() || !sendBody.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscriber</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The subscriber will be permanently removed.
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
