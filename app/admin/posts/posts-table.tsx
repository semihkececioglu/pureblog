"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IPost, ICategory } from "@/types";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download } from "lucide-react";

type PostRow = IPost & { category: ICategory; _id: string };
type SortKey = "title" | "views" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function PostsTable({
  posts,
  categories,
  totalCount,
}: {
  posts: PostRow[];
  categories: (ICategory & { _id: string })[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Read state from URL
  const search = searchParams.get("q") ?? "";
  const statusFilter = (searchParams.get("status") ?? "all") as "all" | "draft" | "published";
  const categoryFilter = searchParams.get("category") ?? "all";
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

  const selectedCategoryName = categoryFilter === "all"
    ? "All Categories"
    : categories.find((c) => c.slug === categoryFilter)?.name ?? "All Categories";

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
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
          <Download width={14} height={14} />
          Export CSV
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No results.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="border border-border p-4 flex items-start justify-between gap-4">
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
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Edit">
                  <Link href={`/admin/posts/${post._id}`}><Pencil width={16} height={16} /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="View on site">
                  <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink width={16} height={16} />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Delete" onClick={() => setDeleteId(post._id)}>
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
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                Title <SortIcon k="title" />
              </TableHead>
              <TableHead>Category</TableHead>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell className="font-medium max-w-[220px] truncate">{post.title}</TableCell>
                  <TableCell>{(post.category as ICategory)?.name ?? "—"}</TableCell>
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Link href={`/admin/posts/${post._id}`}>
                          <Pencil width={14} height={14} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="View on site">
                        <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink width={14} height={14} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteId(post._id)}>
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
