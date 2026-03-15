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
import { Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CategoryListProps {
  initialCategories: (ICategory & { _id: string })[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);

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

  async function onSubmit(data: FormData): Promise<void> {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.data) {
      setCategories((prev) => [...prev, json.data]);
      reset();
      router.refresh();
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c._id !== id));
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
                className="flex items-center justify-between border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{cat.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete category"
                  onClick={() => handleDelete(cat._id)}
                >
                  <Trash2 width={16} height={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold mb-4">New Category</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              onChange={(e) => {
                register("name").onChange(e);
                setValue("slug", generateSlug(e.target.value));
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
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </div>
    </div>
  );
}
