"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IComment } from "@/types";
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
import { Check, X, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

type CommentWithPost = IComment & {
  _id: string;
  postId: { _id: string; title: string; slug: string } | null;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

interface CommentModerationListProps {
  initialComments: CommentWithPost[];
  totalCount: number;
}

export function CommentModerationList({ initialComments, totalCount }: CommentModerationListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [comments, setComments] = useState(initialComments);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerComment, setDrawerComment] = useState<CommentWithPost | null>(null);

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
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
      toast.success(status === "approved" ? "Comment approved." : "Comment rejected.");
    } else {
      toast.error("Failed to update comment.");
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/comments/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
      router.refresh();
      toast.success("Comment deleted.");
    } else {
      setDeleteId(null);
      toast.error("Failed to delete comment.");
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statusLabels: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  function ActionItems({ comment, onClose }: { comment: CommentWithPost; onClose?: () => void }) {
    return (
      <>
        {comment.status !== "approved" && (
          <DropdownMenuItem onClick={() => { updateStatus(comment._id, "approved"); onClose?.(); }}>
            <Check width={14} height={14} /> Approve
          </DropdownMenuItem>
        )}
        {comment.status !== "rejected" && (
          <DropdownMenuItem onClick={() => { updateStatus(comment._id, "rejected"); onClose?.(); }}>
            <X width={14} height={14} /> Reject
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => { setDeleteId(comment._id); onClose?.(); }}>
          <Trash2 width={14} height={14} /> Delete
        </DropdownMenuItem>
      </>
    );
  }

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

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`border p-4 flex items-start justify-between gap-4 ${
                comment.status === "pending" ? "border-foreground" : "border-border opacity-60"
              }`}
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

              {/* Desktop: dropdown */}
              <div className="hidden md:block shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                    <MoreHorizontal width={14} height={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ActionItems comment={comment} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: opens action drawer */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                aria-label="Actions"
                onClick={() => setDrawerComment(comment)}
              >
                <MoreHorizontal width={18} height={18} />
              </Button>
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
      <Sheet open={!!drawerComment} onOpenChange={(open) => { if (!open) setDrawerComment(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">{drawerComment?.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            {drawerComment?.status !== "approved" && (
              <button
                onClick={() => { updateStatus(drawerComment!._id, "approved"); setDrawerComment(null); }}
                className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
              >
                <Check width={16} height={16} /> Approve
              </button>
            )}
            {drawerComment?.status !== "rejected" && (
              <button
                onClick={() => { updateStatus(drawerComment!._id, "rejected"); setDrawerComment(null); }}
                className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
              >
                <X width={16} height={16} /> Reject
              </button>
            )}
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerComment!._id); setDrawerComment(null); }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
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
