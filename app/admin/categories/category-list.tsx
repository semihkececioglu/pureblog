"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ICategory } from "@/types";
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

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type CategoryWithCount = ICategory & { _id: string; postCount: number };

interface CategoryListProps {
  initialCategories: CategoryWithCount[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerCat, setDrawerCat] = useState<CategoryWithCount | null>(null);
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

  function startEdit(cat: CategoryWithCount) {
    setEditingId(cat._id);
    setValue("name", cat.name);
    setValue("slug", cat.slug);
    setValue("description", cat.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    reset();
  }

  async function onSubmit(data: FormData): Promise<void> {
    if (editingId) {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setCategories((prev) => prev.map((c) => c._id === editingId ? { ...c, ...data } : c));
        setEditingId(null);
        setFormSheet(null);
        reset();
        router.refresh();
      }
    } else {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setCategories((prev) => [...prev, { ...json.data, postCount: 0 }]);
        setFormSheet(null);
        reset();
        router.refresh();
      }
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c._id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
  }

  const categoryForm = (
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
          {isSubmitting ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Category")}
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  const categoryListItems = (
    <div className="flex flex-col gap-2">
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        categories.map((cat) => (
          <div
            key={cat._id}
            className={`flex items-center justify-between border px-4 py-3 transition-colors ${
              editingId === cat._id ? "border-foreground" : "border-border"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{cat.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {cat.slug}
                {cat.postCount > 0 && (
                  <span className="ml-2 text-foreground">{cat.postCount} posts</span>
                )}
              </p>
            </div>

            {/* Desktop: dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Actions">
                  <MoreHorizontal width={14} height={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(cat)}>
                    <Pencil width={14} height={14} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(cat._id)}>
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
              onClick={() => setDrawerCat(cat)}
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
            Add Category
          </Button>
        </div>
        {categoryListItems}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">All Categories</h2>
          {categoryListItems}
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">
            {editingId ? "Edit Category" : "New Category"}
          </h2>
          {categoryForm}
        </div>
      </div>

      {/* Mobile: action drawer */}
      <Sheet open={!!drawerCat} onOpenChange={(open) => { if (!open) setDrawerCat(null); }}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">{drawerCat?.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 pb-4">
            <button
              onClick={() => {
                startEdit(drawerCat!);
                setFormSheet("edit");
                setDrawerCat(null);
              }}
              className="flex items-center gap-3 py-3 text-sm hover:bg-muted transition-colors rounded-md px-2"
            >
              <Pencil width={16} height={16} /> Edit
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => { setDeleteId(drawerCat!._id); setDrawerCat(null); }}
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
            <SheetTitle className="text-left">{formSheet === "edit" ? "Edit Category" : "Add Category"}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {categoryForm}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Posts in this category will lose their category assignment.
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
