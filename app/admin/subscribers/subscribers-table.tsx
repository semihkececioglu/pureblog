"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ISubscriber } from "@/types";
import { Button } from "@/components/ui/button";
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
import { Trash2, RefreshCw, Download, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type SubscriberRow = ISubscriber & { _id: string };

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

  // Read state from URL
  const search = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === "1") params.delete(k);
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
    }
    setTogglingId(null);
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/subscribers/${deleteId}`, { method: "DELETE" });
    setSubscribers((prev) => prev.filter((s) => s._id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
    router.refresh();
  }

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const paginated = subscribers;

  function handleExport() {
    window.open("/api/admin/subscribers/export", "_blank");
  }

  async function handleSendEmail(): Promise<void> {
    if (!sendSubject.trim() || !sendBody.trim()) return;
    setSending(true);
    await fetch("/api/admin/subscribers/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: sendSubject, body: sendBody }),
    });
    setSending(false);
    setSendOpen(false);
    setSendSubject("");
    setSendBody("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search by email..."
          defaultValue={search}
          onChange={(e) => setParams({ q: e.target.value, page: "1" })}
          className="max-w-xs"
        />
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
        {paginated.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No results.</p>
        ) : (
          paginated.map((s) => (
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
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label={s.status === "active" ? "Unsubscribe" : "Reactivate"}
                  onClick={() => handleToggleStatus(s._id)}
                  disabled={togglingId === s._id}
                >
                  <RefreshCw width={16} height={16} className={togglingId === s._id ? "animate-spin" : ""} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Delete"
                  onClick={() => setDeleteId(s._id)}
                >
                  <Trash2 width={16} height={16} />
                </Button>
              </div>
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
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s) => (
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={s.status === "active" ? "Unsubscribe" : "Reactivate"}
                        onClick={() => handleToggleStatus(s._id)}
                        disabled={togglingId === s._id}
                      >
                        <RefreshCw width={14} height={14} className={togglingId === s._id ? "animate-spin" : ""} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setDeleteId(s._id)}
                      >
                        <Trash2 width={14} height={14} />
                      </Button>
                    </div>
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
