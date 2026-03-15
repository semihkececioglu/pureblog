"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ICategory } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10).max(160),
  category: z.string().min(1, "Category is required"),
  tags: z.string(),
  coverImage: z.string().optional(),
  published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface PostFormProps {
  initialData?: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage?: string;
    status: "draft" | "published";
  };
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      category: initialData?.category ?? "",
      tags: initialData?.tags.join(", ") ?? "",
      coverImage: initialData?.coverImage ?? "",
      published: initialData?.status === "published",
    },
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => setCategories(res.data ?? []));
  }, []);

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function handleCoverUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (json.data?.url) setValue("coverImage", json.data.url);
    setUploading(false);
  }

  async function onSubmit(data: FormData): Promise<void> {
    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content,
      category: data.category,
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: data.coverImage,
      status: data.published ? "published" : "draft",
    };

    const url = initialData
      ? `/api/admin/posts/${initialData._id}`
      : "/api/admin/posts";
    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/admin/posts");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            onChange={(e) => {
              register("title").onChange(e);
              if (!initialData) setValue("slug", generateSlug(e.target.value));
            }}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" rows={2} {...register("excerpt")} />
        {errors.excerpt && (
          <p className="text-xs text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Content</Label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register("category")}
            className="border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={String(cat._id)} value={String(cat._id)}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="react, nextjs, typescript"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="coverImage">Cover Image</Label>
        <div className="flex items-center gap-3">
          <Input
            id="coverImage"
            {...register("coverImage")}
            placeholder="https://..."
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
            >
              <span>{uploading ? "Uploading..." : "Upload"}</span>
            </Button>
          </label>
        </div>
        {watch("coverImage") && (
          <img
            src={watch("coverImage")}
            alt="Cover preview"
            className="mt-2 h-32 object-cover"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="published"
          checked={watch("published")}
          onCheckedChange={(val) => setValue("published", val)}
        />
        <Label htmlFor="published">Publish immediately</Label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Post"
              : "Create Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/posts")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
