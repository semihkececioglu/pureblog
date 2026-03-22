"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IPostSeries } from "@/types";
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
        setSeries((prev) => prev.map((s) => (s._id === editingId ? { ...s, ...data } : s)));
        setEditingId(null);
        reset();
        router.refresh();
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
        reset();
        router.refresh();
      }
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/series/${deleteId}`, { method: "DELETE" });
    setSeries((prev) => prev.filter((s) => s._id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="font-serif text-xl font-bold mb-4">All Series</h2>
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit series"
                    onClick={() => (editingId === item._id ? cancelEdit() : startEdit(item))}
                  >
                    {editingId === item._id ? (
                      <X width={16} height={16} />
                    ) : (
                      <Pencil width={16} height={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete series"
                    onClick={() => setDeleteId(item._id)}
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
          {editingId ? "Edit Series" : "New Series"}
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
              {isSubmitting
                ? editingId
                  ? "Saving..."
                  : "Creating..."
                : editingId
                  ? "Save Changes"
                  : "Create Series"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <Dialog
        open={!!deleteId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Series</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this series? Posts in this series will lose their
              series assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
