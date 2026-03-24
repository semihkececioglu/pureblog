"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IPostSeries } from "@/types";
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
import { Trash2, Pencil, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type SeriesItem = IPostSeries & { _id: string };

interface SeriesListProps {
  initialSeries: SeriesItem[];
}

export function SeriesList({ initialSeries }: SeriesListProps) {
  const router = useRouter();
  const [series, setSeries] = useState(initialSeries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerItem, setDrawerItem] = useState<SeriesItem | null>(null);
  const [formSheet, setFormSheet] = useState<"add" | "edit" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  }

  function startEdit(item: SeriesItem) {
    setEditingId(item._id);
    setValue("name", item.name);
    setValue("slug", item.slug);
    setValue("description", item.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    reset();
  }

  async function onSubmit(data: FormData): Promise<void> {
    if (editingId) {
      const res = await fetch(`/api/admin/series/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setSeries((prev) => prev.map((s) => s._id === editingId ? { ...s, ...data } : s));
        setEditingId(null);
        setFormSheet(null);
        reset();
        router.refresh();
        toast.success("Series updated.");
      } else {
        toast.error("Failed to update series.");
      }
    } else {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setSeries((prev) => [...prev, json.data]);
        setFormSheet(null);
        reset();
        router.refresh();
        toast.success("Series created.");
      } else {
        toast.error("Failed to create series.");
      }
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/series/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setSeries((prev) => prev.filter((s) => s._id !== deleteId));
      setDeleteId(null);
      toast.success("Series deleted.");
    } else {
      setDeleteId(null);
      toast.error("Failed to delete series.");
    }
  }

  const seriesForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          onChange={(e) => {
            register("name").onChange(e);
            if (!editingId) setValue("slug", generateSlug(e.target.value));
          }}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Series")}
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  const seriesListItems = (
    <div className="flex flex-col gap-2">
      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground">No series yet.</p>
      ) : (
        series.map((item) => (
          <div
            key={item._id}
            className={`flex items-center justify-between border px-4 py-3 transition-colors ${
              editingId === item._id ? "border-foreground" : "border-border"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.slug}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              )}
            </div>

            {/* Desktop: dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                  <MoreHorizontal width={14} height={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(item)}>
                    <Pencil width={14} height={14} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(item._id)}>
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
              onClick={() => setDrawerItem(item)}
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
        <div className="mb-4">
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              reset();
              setFormSheet("add");
            }}
            className="flex items-center gap-2"
          >
            <Plus width={14} height={14} />
            Add Series
          </Button>
        </div>
        {seriesListItems}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">All Series</h2>
          {seriesListItems}
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">
            {editingId ? "Edit Series" : "New Series"}
          </h2>
          {seriesForm}
        </div>
      </div>

      {/* Mobile: action drawer */}
      <Sheet open={!!drawerItem} onOpenChange={(open) => { if (!open) setDrawerItem(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">{drawerItem?.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => {
                startEdit(drawerItem!);
                setFormSheet("edit");
                setDrawerItem(null);
              }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <Pencil width={16} height={16} /> Edit
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerItem!._id); setDrawerItem(null); }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile: add/edit form sheet */}
      <Sheet open={!!formSheet} onOpenChange={(open) => { if (!open) { setFormSheet(null); cancelEdit(); } }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-left">{formSheet === "edit" ? "Edit Series" : "Add Series"}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {seriesForm}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Series</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this series? Posts in this series will lose their series assignment.
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
    </>
  );
}
