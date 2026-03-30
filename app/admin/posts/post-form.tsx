"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import dynamic from "next/dynamic";
const TiptapEditor = dynamic(
  () => import("@/components/editor/tiptap-editor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded bg-muted" /> },
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { IAuthor, ICategory, IPostSeries } from "@/types";
import { CalendarIcon, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10).max(160),
  category: z.string().min(1, "Category is required"),
  tags: z.string(),
  coverImage: z.string().optional(),
  featured: z.boolean(),
  scheduledAt: z.string().optional(),
  series: z.string().optional(),
  seriesOrder: z.string().optional(),
  author: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export interface PostFormProps {
  categories: ICategory[];
  seriesList: IPostSeries[];
  existingTags: string[];
  authors: IAuthor[];
  initialData?: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage?: string;
    featured?: boolean;
    scheduledAt?: string;
    series?: string;
    seriesOrder?: number;
    author?: string;
  };
}


const ITEM_H = 36;
const VISIBLE = 5;
const CONT_H = ITEM_H * VISIBLE;
const PAD = (CONT_H - ITEM_H) / 2;

function ScrollColumn({ values, selected, onChange }: { values: string[]; selected: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProg = useRef(false);

  useEffect(() => {
    const idx = values.indexOf(selected);
    if (ref.current && idx !== -1) {
      isProg.current = true;
      ref.current.scrollTop = idx * ITEM_H;
      requestAnimationFrame(() => { isProg.current = false; });
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [selected, values]);

  function handleScroll() {
    if (isProg.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(values.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      onChange(values[idx]);
    }, 80);
  }

  return (
    <div className="relative" style={{ width: 44, height: CONT_H }}>
      <div className="absolute inset-x-1 rounded-md bg-muted pointer-events-none" style={{ top: PAD, height: ITEM_H }} />
      <div ref={ref} onScroll={handleScroll} className="absolute inset-0 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: "y mandatory" }}>
        <div style={{ height: PAD }} />
        {values.map((v) => (
          <div
            key={v}
            style={{ height: ITEM_H, scrollSnapAlign: "center" } as React.CSSProperties}
            className={`flex items-center justify-center font-mono text-sm select-none cursor-pointer transition-colors ${v === selected ? "text-foreground font-semibold" : "text-muted-foreground/50"}`}
            onClick={() => {
              isProg.current = true;
              ref.current?.scrollTo({ top: values.indexOf(v) * ITEM_H, behavior: "smooth" });
              onChange(v);
              setTimeout(() => { isProg.current = false; }, 400);
            }}
          >{v}</div>
        ))}
        <div style={{ height: PAD }} />
      </div>
    </div>
  );
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const datePart = value ? value.split("T")[0] : "";
  const hour = value ? (value.split("T")[1] ?? "").slice(0, 2) || "00" : "00";
  const date = datePart ? new Date(`${datePart}T12:00:00`) : undefined;
  const hoursArr = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const baseDate = datePart || format(new Date(), "yyyy-MM-dd");

  function handleDaySelect(day: Date | undefined) {
    if (!day) { onChange(""); return; }
    onChange(`${format(day, "yyyy-MM-dd")}T${hour}:00`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={`flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-muted${!date ? " text-muted-foreground" : ""}`}>
        <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        {date ? `${format(date, "d MMM yyyy")} — ${hour}:00` : "Pick a date and time"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
        <div className="flex">
          <Calendar mode="single" selected={date} onSelect={handleDaySelect} />
          <div className="border-l border-border flex flex-col">
            <div className="px-3 pt-3 pb-2 border-b border-border">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Hour</span>
            </div>
            <div className="px-2 py-2">
              <ScrollColumn values={hoursArr} selected={hour} onChange={(h) => onChange(`${baseDate}T${h}:00`)} />
            </div>
          </div>
        </div>
        {value && (
          <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-muted/20">
            <span className="font-mono text-xs text-muted-foreground">{date ? format(date, "d MMM yyyy") : "—"} · {hour}:00</span>
            <button type="button" onClick={() => onChange("")} className="font-mono text-xs text-muted-foreground hover:text-destructive transition-colors">Clear</button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border rounded-t-lg">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TagsInput({ value, onChange, existingTags }: { value: string; onChange: (v: string) => void; existingTags: string[] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parts = value.split(",");
  const currentPartial = parts[parts.length - 1].trim().toLowerCase();
  const alreadyAdded = parts.slice(0, -1).map((p) => p.trim().toLowerCase());

  const suggestions = currentPartial.length > 0
    ? existingTags.filter((tag) =>
        tag.toLowerCase().includes(currentPartial) &&
        !alreadyAdded.includes(tag.toLowerCase())
      )
    : [];

  function selectSuggestion(tag: string) {
    const existing = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);
    onChange([...existing, tag].join(", ") + ", ");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="react, nextjs, typescript"
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border bg-background rounded-md shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostForm({ categories, seriesList, existingTags, authors, initialData }: PostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content ?? "");
  const [uploading, setUploading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitTypeRef = useRef<"draft" | "publish" | "continue">("draft");
  const serverSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      category: initialData?.category ?? "",
      tags: initialData?.tags?.join(", ") ?? "",
      coverImage: initialData?.coverImage ?? "",
      featured: initialData?.featured ?? false,
      scheduledAt: initialData?.scheduledAt ?? "",
      series: initialData?.series ?? "",
      seriesOrder: initialData?.seriesOrder?.toString() ?? "",
      author: initialData?.author ?? "",
    },
  });

  // Server autosave — fires 8s after last change, existing posts only
  useEffect(() => {
    if (!initialData?._id) return;
    if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    serverSaveTimer.current = setTimeout(async () => {
      const data = getValues();
      if (!data.title || data.title.length < 3) return;
      setAutoSaveStatus("saving");
      try {
        const res = await fetch("/api/admin/posts/autosave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initialData._id, ...data, content }),
        });
        setAutoSaveStatus(res.ok ? "saved" : "error");
        if (res.ok) setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } catch {
        setAutoSaveStatus("error");
      }
    }, 8000);
    return () => { if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current); };
  }, [content, initialData?._id, getValues]);

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    // Reset so same file can be re-selected
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        setValue("coverImage", json.data.url);
        toast.success("Image uploaded.");
      } else {
        toast.error(json.error ?? "Upload failed.");
      }
    } catch {
      toast.error("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormData): Promise<void> {
    const isContinue = submitTypeRef.current === "continue";
    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content,
      category: data.category,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: data.coverImage,
      featured: data.featured,
      status: submitTypeRef.current === "publish" ? "published" : "draft",
      scheduledAt: submitTypeRef.current === "publish" ? null : (data.scheduledAt || null),
      series: data.series || null,
      seriesOrder: data.seriesOrder ? parseInt(data.seriesOrder, 10) : null,
      author: data.author || null,
    };

    const url = initialData?._id ? `/api/admin/posts/${initialData._id}` : "/api/admin/posts";
    const method = initialData?._id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (isContinue) {
        const json = await res.json();
        toast.success("Draft saved.");
        if (!initialData?._id && json.data?._id) {
          router.push(`/admin/posts/${json.data._id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.success(submitTypeRef.current === "publish" ? "Post published." : "Draft saved.");
        router.push("/admin/posts");
      }
    } else {
      toast.error("Failed to save post.");
    }
  }

  const coverImage = watch("coverImage");

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Basic Info */}
        <FormSection title="Basic Info">
          <FieldRow>
            <Field label="Title" error={errors.title?.message}>
              <Input
                {...register("title")}
                onChange={(e) => {
                  register("title").onChange(e);
                  if (!initialData) setValue("slug", generateSlug(e.target.value));
                }}
                placeholder="My awesome post"
              />
            </Field>
            <Field label="Slug" error={errors.slug?.message} hint="Used in the URL">
              <Input {...register("slug")} placeholder="my-awesome-post" className="font-mono text-sm" />
            </Field>
          </FieldRow>
          <Field label="Excerpt" error={errors.excerpt?.message} hint="Max 160 characters — used in meta description">
            <Textarea {...register("excerpt")} rows={2} placeholder="A short summary of the post..." />
            <div className="flex justify-end">
              <span className={`font-mono text-[10px] ${(watch("excerpt")?.length ?? 0) > 140 ? "text-destructive" : "text-muted-foreground"}`}>
                {watch("excerpt")?.length ?? 0}/160
              </span>
            </div>
          </Field>
        </FormSection>

        {/* Content */}
        <FormSection title="Content">
          <TiptapEditor
            content={content}
            onChange={setContent}
            previewData={{
              title: watch("title"),
              excerpt: watch("excerpt"),
              coverImage: watch("coverImage"),
              categoryName: categories.find((c) => String(c._id) === watch("category"))?.name,
              tags: watch("tags")?.split(",").map((t) => t.trim()).filter(Boolean),
            }}
          />
        </FormSection>

        {/* Taxonomy */}
        <FormSection title="Taxonomy">
          <FieldRow>
            <Field label="Category" error={errors.category?.message}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8">
                      <span className={!field.value ? "text-muted-foreground" : undefined}>
                        {field.value
                          ? (categories.find((c) => String(c._id) === field.value)?.name ?? field.value)
                          : "Select a category..."}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={String(cat._id)} value={String(cat._id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagsInput value={field.value} onChange={field.onChange} existingTags={existingTags} />
                )}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Author" hint="Optional — assign an author to this post">
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || "__none__"} onValueChange={(v) => field.onChange(!v || v === "__none__" ? "" : v)}>
                    <SelectTrigger className="h-8">
                      <span className={(!field.value || field.value === "__none__") ? "text-muted-foreground" : undefined}>
                        {field.value && field.value !== "__none__"
                          ? (authors.find((a) => String(a._id) === field.value)?.name ?? field.value)
                          : "No author"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No author</SelectItem>
                      {authors.map((a) => (
                        <SelectItem key={String(a._id)} value={String(a._id)}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Series" hint="Optional — group posts into a series">
              <Controller
                name="series"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || "__none__"} onValueChange={(v: string | null) => field.onChange(!v || v === "__none__" ? "" : v)}>
                    <SelectTrigger className="h-8">
                      <span className={(!field.value || field.value === "__none__") ? "text-muted-foreground" : undefined}>
                        {field.value && field.value !== "__none__"
                          ? (seriesList.find((s) => String(s._id) === field.value)?.name ?? field.value)
                          : "No series"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No series</SelectItem>
                      {seriesList.map((s) => (
                        <SelectItem key={String(s._id)} value={String(s._id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            {watch("series") && watch("series") !== "__none__" && (
              <Field label="Order in series" hint="Position within the series">
                <Input
                  {...register("seriesOrder")}
                  type="number"
                  min={1}
                  placeholder="1"
                />
              </Field>
            )}
          </FieldRow>
        </FormSection>

        {/* Cover Image */}
        <FormSection title="Cover Image">
          <div className="flex items-center gap-3">
            <Input {...register("coverImage")} placeholder="https://..." />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {coverImage && (
            <div className="relative group w-full">
              <img src={coverImage} alt="Cover preview" className="w-full h-40 object-cover rounded border border-border" />
              <button
                type="button"
                onClick={() => setValue("coverImage", "")}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white hover:border-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </FormSection>

        {/* Settings */}
        <FormSection title="Settings">
          <Field label="Schedule for later" hint="Leave empty to keep as unscheduled draft">
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          </Field>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Featured post</p>
              <p className="text-xs text-muted-foreground">Show this post in the featured section</p>
            </div>
            <Switch
              id="featured"
              checked={watch("featured")}
              onCheckedChange={(val) => setValue("featured", val)}
            />
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => { submitTypeRef.current = "publish"; }}
          >
            {isSubmitting && submitTypeRef.current === "publish" ? "Publishing..." : "Publish"}
          </Button>

          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => { submitTypeRef.current = "draft"; }}
          >
            {isSubmitting && submitTypeRef.current === "draft" ? "Saving..." : "Save Draft"}
          </Button>

          <Button
            type="submit"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => { submitTypeRef.current = "continue"; }}
          >
            {isSubmitting && submitTypeRef.current === "continue" ? "Saving..." : "Save & Continue"}
          </Button>

          <Button type="button" variant="ghost" onClick={() => router.push("/admin/posts")}>
            Cancel
          </Button>

          {autoSaveStatus === "saving" && (
            <span className="font-mono text-xs text-muted-foreground ml-auto">Saving…</span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="font-mono text-xs text-muted-foreground ml-auto">Draft saved</span>
          )}
          {autoSaveStatus === "error" && (
            <span className="font-mono text-xs text-destructive ml-auto">Save failed</span>
          )}
        </div>
      </form>
    </div>
  );
}
