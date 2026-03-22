"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ICategory } from "@/types";
import { Button } from "@/components/ui/button";
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
import { Trash2, Pencil, X } from "lucide-react";

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
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingId ? { ...c, ...data } : c
          )
        );
        setEditingId(null);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="font-serif text-xl font-bold mb-4">All Categories</h2>
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit category"
                    onClick={() => editingId === cat._id ? cancelEdit() : startEdit(cat)}
                  >
                    {editingId === cat._id
                      ? <X width={16} height={16} />
                      : <Pencil width={16} height={16} />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete category"
                    onClick={() => setDeleteId(cat._id)}
                  >
                    <Trash2 width={16} height={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold mb-4">
          {editingId ? "Edit Category" : "New Category"}
        </h2>
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
      </div>

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
    </div>
  );
}
