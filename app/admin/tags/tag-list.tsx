"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Trash2, Pencil, MoreHorizontal, Tag, Search } from "lucide-react";
import { toast } from "sonner";

const renameSchema = z.object({
  newTag: z.string().min(1, "Tag name is required"),
});

type RenameFormData = z.infer<typeof renameSchema>;
type TagItem = { name: string; count: number };

interface TagListProps {
  initialTags: TagItem[];
}

export function TagList({ initialTags }: TagListProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerTag, setDrawerTag] = useState<TagItem | null>(null);
  const [formSheet, setFormSheet] = useState(false);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const search = urlSearchParams.get("q") ?? "";

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(urlSearchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "") params.delete(k);
        else params.set(k, v);
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, urlSearchParams],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RenameFormData>({ resolver: zodResolver(renameSchema) });

  function startEdit(tag: TagItem) {
    setEditingTag(tag.name);
    setValue("newTag", tag.name);
  }

  function cancelEdit() {
    setEditingTag(null);
    reset();
  }

  async function onSubmit(data: RenameFormData): Promise<void> {
    if (!editingTag) return;
    const res = await fetch("/api/admin/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldTag: editingTag, newTag: data.newTag }),
    });
    const json = await res.json();
    if (json.data) {
      setTags((prev) =>
        prev.map((t) =>
          t.name === editingTag ? { ...t, name: data.newTag } : t
        )
      );
      setEditingTag(null);
      setFormSheet(false);
      reset();
      router.refresh();
      toast.success("Tag renamed.");
    } else {
      toast.error("Failed to rename tag.");
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteTag) return;
    setDeleting(true);
    const res = await fetch("/api/admin/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: deleteTag }),
    });
    setDeleting(false);
    if (res.ok) {
      setTags((prev) => prev.filter((t) => t.name !== deleteTag));
      setDeleteTag(null);
      toast.success("Tag removed from all posts.");
    } else {
      setDeleteTag(null);
      toast.error("Failed to delete tag.");
    }
  }

  const renameForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="newTag">Tag Name</Label>
        <Input id="newTag" {...register("newTag")} />
        {errors.newTag && (
          <p className="text-xs text-destructive">{errors.newTag.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Rename Tag"}
        </Button>
        <Button type="button" variant="outline" onClick={cancelEdit}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const tagListItems = (
    <div className="flex flex-col gap-2">
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? "No tags match your search." : "No tags yet. Add tags to your posts to see them here."}
        </p>
      ) : (
        tags.map((tag) => (
          <div
            key={tag.name}
            className={`flex items-center justify-between border px-4 py-3 transition-colors ${
              editingTag === tag.name ? "border-foreground" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <Tag width={14} height={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">{tag.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {tag.count} {tag.count === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>

            {/* Desktop: dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                  aria-label="Actions"
                >
                  <MoreHorizontal width={14} height={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      startEdit(tag);
                    }}
                  >
                    <Pencil width={14} height={14} /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTag(tag.name)}
                  >
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
              onClick={() => setDrawerTag(tag)}
            >
              <MoreHorizontal width={18} height={18} />
            </Button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} height={14} />
          <Input
            placeholder="Search tags..."
            defaultValue={search}
            onChange={(e) => setParams({ q: e.target.value })}
            className="pl-8"
          />
        </div>
        {tagListItems}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">
            All Tags{" "}
            <span className="text-muted-foreground font-normal text-base">
              ({tags.length})
            </span>
          </h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} height={14} />
            <Input
              placeholder="Search tags..."
              defaultValue={search}
              onChange={(e) => setParams({ q: e.target.value })}
              className="pl-8"
            />
          </div>
          {tagListItems}
        </div>
        <div>
          {editingTag ? (
            <>
              <h2 className="font-serif text-xl font-bold mb-4">Rename Tag</h2>
              {renameForm}
            </>
          ) : (
            <div className="text-sm text-muted-foreground border border-dashed border-border p-6">
              <p>Select a tag to rename it, or delete it to remove it from all posts.</p>
              <p className="mt-2 text-xs">Tags are created automatically when added to posts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: action drawer */}
      <Sheet
        open={!!drawerTag}
        onOpenChange={(open) => {
          if (!open) setDrawerTag(null);
        }}
      >
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">
              {drawerTag?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => {
                startEdit(drawerTag!);
                setFormSheet(true);
                setDrawerTag(null);
              }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <Pencil width={16} height={16} /> Rename
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => {
                setDeleteTag(drawerTag!.name);
                setDrawerTag(null);
              }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile: rename form sheet */}
      <Sheet
        open={formSheet}
        onOpenChange={(open) => {
          if (!open) {
            setFormSheet(false);
            cancelEdit();
          }
        }}
      >
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-left">Rename Tag</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{renameForm}</div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <Dialog
        open={!!deleteTag}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteTag(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">"{deleteTag}"</span>? This will
              remove the tag from all posts. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTag(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
