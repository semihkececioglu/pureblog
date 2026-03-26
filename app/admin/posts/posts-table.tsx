"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IPost, ICategory, IAuthor } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download, MoreHorizontal } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";

type PostRow = IPost & { category: ICategory; author?: IAuthor; _id: string };
type SortKey = "title" | "views" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function PostsTable({
  posts,
  categories,
  authors,
  totalCount,
}: {
  posts: PostRow[];
  categories: (ICategory & { _id: string })[];
  authors: (IAuthor & { _id: string })[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerPost, setDrawerPost] = useState<PostRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"publish" | "draft" | "delete" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Read state from URL
  const search = searchParams.get("q") ?? "";
  const statusFilter = (searchParams.get("status") ?? "all") as "all" | "draft" | "published";
  const categoryFilter = searchParams.get("category") ?? "all";
  const authorFilter = searchParams.get("author") ?? "all";
  const sortKey = (searchParams.get("sort") ?? "createdAt") as SortKey;
  const sortDir = (searchParams.get("dir") ?? "desc") as SortDir;
  const page = Number(searchParams.get("page") ?? "1");

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === "all" || v === "1") params.delete(k);
        else params.set(k, v);
      });
      setSelected(new Set());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function toggleSort(key: SortKey) {
    const newDir = sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : "desc";
    setParams({ sort: key, dir: newDir, page: "1" });
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown width={10} height={10} className="inline ml-1 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp width={12} height={12} className="inline ml-1" />
      : <ChevronDown width={12} height={12} className="inline ml-1" />;
  }

  const allIds = posts.map((p) => p._id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    await fetch("/api/admin/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action: bulkAction }),
    });
    setBulkLoading(false);
    setBulkAction(null);
    setSelected(new Set());
    router.refresh();
  }

  const selectedCategoryName = categoryFilter === "all"
    ? "All Categories"
    : categories.find((c) => c.slug === categoryFilter)?.name ?? "All Categories";

  const selectedAuthorName = authorFilter === "all"
    ? "All Authors"
    : authors.find((a) => a.slug === authorFilter)?.name ?? "All Authors";

  function handleExport() {
    window.open("/api/admin/posts/export", "_blank");
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/posts/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by title..."
          defaultValue={search}
          onChange={(e) => setParams({ q: e.target.value, page: "1" })}
          className="max-w-xs"
        />
        <div className="flex items-center gap-1">
          {(["all", "draft", "published"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setParams({ status: s, page: "1" })}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        {categories.length > 0 && (
          <Select
            value={categoryFilter}
            onValueChange={(val: string | null) => setParams({ category: val ?? "all", page: "1" })}
          >
            <SelectTrigger className="w-48">
              <span className={categoryFilter === "all" ? "text-muted-foreground" : ""}>
                {selectedCategoryName}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {authors.length > 0 && (
          <Select
            value={authorFilter}
            onValueChange={(val: string | null) => setParams({ author: val ?? "all", page: "1" })}
          >
            <SelectTrigger className="w-40">
              <span className={authorFilter === "all" ? "text-muted-foreground" : ""}>
                {selectedAuthorName}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authors.map((a) => (
                <SelectItem key={a._id} value={a.slug}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
          <Download width={14} height={14} />
          Export CSV
        </Button>
      </div>

      {/* Bulk action toolbar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted border border-border text-sm">
          <span className="font-mono text-xs text-muted-foreground">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => setBulkAction("publish")}>
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBulkAction("draft")}>
              Set Draft
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkAction("delete")}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No results.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="border border-border p-4 flex items-start justify-between gap-4">
              <Checkbox
                checked={selected.has(post._id)}
                onCheckedChange={() => toggleOne(post._id)}
                className="mt-0.5 shrink-0"
                aria-label="Select post"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`font-mono text-xs uppercase tracking-widest ${
                    post.status === "published" ? "text-foreground" : "text-muted-foreground"
                  }`}>{post.status}</span>
                  {(post.category as ICategory)?.name && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {(post.category as ICategory).name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-xs">{post.views} views</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Actions"
                onClick={() => setDrawerPost(post)}
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
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                Title <SortIcon k="title" />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("views")}>
                Views <SortIcon k="views" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                Date <SortIcon k="createdAt" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post._id} data-selected={selected.has(post._id)}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(post._id)}
                      onCheckedChange={() => toggleOne(post._id)}
                      aria-label="Select post"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">{post.title}</TableCell>
                  <TableCell>{(post.category as ICategory)?.name ?? "—"}</TableCell>
                  <TableCell>
                    {post.author ? (
                      <div className="flex items-center gap-2">
                        {(post.author as IAuthor).avatar ? (
                          <img
                            src={(post.author as IAuthor).avatar}
                            alt={(post.author as IAuthor).name}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted shrink-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground border border-border">
                            {(post.author as IAuthor).name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs">{(post.author as IAuthor).name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono text-xs uppercase tracking-widest ${
                      post.status === "published" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell><span className="font-mono text-xs">{post.views}</span></TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                        <MoreHorizontal width={14} height={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post._id}`)}>
                          <Pencil width={14} height={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                          <ExternalLink width={14} height={14} />
                          View on site
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(post._id)}>
                          <Trash2 width={14} height={14} />
                          Delete
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

      {/* Pagination */}
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

      {/* Mobile Action Drawer */}
      <Sheet open={!!drawerPost} onOpenChange={(open) => { if (!open) setDrawerPost(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">{drawerPost?.title}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => { router.push(`/admin/posts/${drawerPost?._id}`); setDrawerPost(null); }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <Pencil width={16} height={16} /> Edit
            </button>
            <button
              onClick={() => { window.open(`/blog/${drawerPost?.slug}`, "_blank"); setDrawerPost(null); }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <ExternalLink width={16} height={16} /> View on site
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerPost!._id); setDrawerPost(null); }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulk Action Dialog */}
      <Dialog open={!!bulkAction} onOpenChange={(open) => { if (!open) setBulkAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "delete" ? "Delete Posts" : bulkAction === "publish" ? "Publish Posts" : "Set to Draft"}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "delete"
                ? `Permanently delete ${selected.size} post${selected.size !== 1 ? "s" : ""}? This cannot be undone.`
                : `${bulkAction === "publish" ? "Publish" : "Set to draft"} ${selected.size} post${selected.size !== 1 ? "s" : ""}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>Cancel</Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={bulkLoading}
            >
              {bulkLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The post will be permanently deleted.
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
