"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IComment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type CommentWithPost = IComment & {
  _id: string;
  postId: { _id: string; title: string; slug: string } | null;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

interface CommentModerationListProps {
  initialComments: CommentWithPost[];
  searchParams?: { q?: string; status?: string; sort?: string; page?: string };
}

export function CommentModerationList({ initialComments }: CommentModerationListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [comments, setComments] = useState(initialComments);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Read state from URL
  const search = searchParams.get("q") ?? "";
  const statusFilter = (searchParams.get("status") ?? "all") as StatusFilter;
  const sortDir = (searchParams.get("sort") ?? "desc") as SortDir;
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

  async function updateStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setComments((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/comments/${deleteId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c._id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
  }

  const filtered = useMemo(() => {
    let result = comments.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q) &&
          !c.content.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

    return result;
  }, [comments, search, statusFilter, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusLabels: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, or content..."
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setParams({ sort: sortDir === "desc" ? "asc" : "desc", page: "1" })}
          className="flex items-center gap-1"
        >
          Date
          {sortDir === "desc"
            ? <ChevronDown width={14} height={14} />
            : <ChevronUp width={14} height={14} />
          }
        </Button>
      </div>

      {paginated.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((comment) => (
            <div
              key={comment._id}
              className="border border-border p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium">{comment.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{comment.email}</span>
                  {comment.parentCommentId && (
                    <span className="font-mono text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                      reply
                    </span>
                  )}
                  <span
                    className={`font-mono text-xs uppercase tracking-widest ${
                      comment.status === "approved"
                        ? "text-foreground"
                        : comment.status === "rejected"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {comment.status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comment.postId && (
                  <Link
                    href={`/blog/${comment.postId.slug}#${comment._id}`}
                    target="_blank"
                    className="font-mono text-xs text-muted-foreground hover:text-foreground mb-1 block"
                  >
                    → {comment.postId.title}
                  </Link>
                )}
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {comment.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-[44px] min-w-[44px]"
                      aria-label="Approve"
                      onClick={() => updateStatus(comment._id, "approved")}
                    >
                      <Check width={16} height={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-[44px] min-w-[44px]"
                      aria-label="Reject"
                      onClick={() => updateStatus(comment._id, "rejected")}
                    >
                      <X width={16} height={16} />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Delete"
                  onClick={() => setDeleteId(comment._id)}
                >
                  <Trash2 width={16} height={16} />
                </Button>
              </div>
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

      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The comment will be permanently deleted.
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
