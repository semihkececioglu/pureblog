"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IAuthor } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Pencil, MoreHorizontal, Plus, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  social: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;
type AuthorItem = IAuthor & { _id: string };

interface AuthorListProps {
  initialAuthors: AuthorItem[];
}

export function AuthorList({ initialAuthors }: AuthorListProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawerItem, setDrawerItem] = useState<AuthorItem | null>(null);
  const [formSheet, setFormSheet] = useState<"add" | "edit" | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const avatarValue = watch("avatar");

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.data?.url) {
        setValue("avatar", json.data.url);
        toast.success("Avatar uploaded.");
      } else {
        toast.error(json.error ?? "Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function startEdit(item: AuthorItem) {
    setEditingId(item._id);
    setValue("name", item.name);
    setValue("slug", item.slug ?? "");
    setValue("bio", item.bio ?? "");
    setValue("avatar", item.avatar ?? "");
    setValue("social.twitter", item.social?.twitter ?? "");
    setValue("social.instagram", item.social?.instagram ?? "");
    setValue("social.linkedin", item.social?.linkedin ?? "");
    setValue("social.github", item.social?.github ?? "");
    setValue("social.website", item.social?.website ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    reset();
  }

  async function onSubmit(data: FormData): Promise<void> {
    if (editingId) {
      const res = await fetch(`/api/admin/authors/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setAuthors((prev) =>
          prev.map((a) => (a._id === editingId ? ({ ...a, ...data, _id: editingId } as AuthorItem) : a)),
        );
        setEditingId(null);
        setFormSheet(null);
        reset();
        router.refresh();
        toast.success("Author updated.");
      } else {
        toast.error("Failed to update author.");
      }
    } else {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.data) {
        setAuthors((prev) => [...prev, json.data]);
        setFormSheet(null);
        reset();
        router.refresh();
        toast.success("Author created.");
      } else {
        toast.error("Failed to create author.");
      }
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/authors/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setAuthors((prev) => prev.filter((a) => a._id !== deleteId));
      setDeleteId(null);
      toast.success("Author deleted.");
    } else {
      setDeleteId(null);
      toast.error("Failed to delete author.");
    }
  }

  const authorForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Jane Doe"
          onChange={(e) => {
            register("name").onChange(e);
            if (!editingId) setValue("slug", generateSlug(e.target.value));
          }}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} placeholder="jane-doe" className="font-mono text-sm" />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio (optional)</Label>
        <Textarea id="bio" {...register("bio")} rows={3} placeholder="A short bio..." />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Avatar (optional)</Label>
        <div className="flex items-center gap-2">
          <Input {...register("avatar")} placeholder="https://..." />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
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
        {avatarValue && (
          <div className="relative group w-16 h-16">
            <img
              src={avatarValue}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => setValue("avatar", "")}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white hover:border-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Social Links
        </Label>
        <div className="flex flex-col gap-2">
          <Input {...register("social.twitter")} placeholder="Twitter / X URL" />
          <Input {...register("social.instagram")} placeholder="Instagram URL" />
          <Input {...register("social.linkedin")} placeholder="LinkedIn URL" />
          <Input {...register("social.github")} placeholder="GitHub URL" />
          <Input {...register("social.website")} placeholder="Personal website URL" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingId ? "Saving..." : "Creating..."
            : editingId ? "Save Changes" : "Create Author"}
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  const authorListItems = (
    <div className="flex flex-col gap-2">
      {authors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No authors yet.</p>
      ) : (
        authors.map((item) => (
          <div
            key={item._id}
            className={`flex items-center justify-between border px-4 py-3 transition-colors ${
              editingId === item._id ? "border-foreground" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.bio && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{item.bio}</p>
                )}
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
                      startEdit(item);
                    }}
                  >
                    <Pencil width={14} height={14} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteId(item._id)}
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
            Add Author
          </Button>
        </div>
        {authorListItems}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">All Authors</h2>
          {authorListItems}
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">
            {editingId ? "Edit Author" : "New Author"}
          </h2>
          {authorForm}
        </div>
      </div>

      {/* Mobile: action drawer */}
      <Sheet
        open={!!drawerItem}
        onOpenChange={(open) => {
          if (!open) setDrawerItem(null);
        }}
      >
        <SheetContent side="bottom" showCloseButton={false} className="gap-1">
          <SheetHeader className="px-4 pt-4 pb-0">
            <SheetTitle className="text-left text-sm font-medium leading-snug">
              {drawerItem?.name}
            </SheetTitle>
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
              onClick={() => {
                setDeleteId(drawerItem!._id);
                setDrawerItem(null);
              }}
              className="flex items-center gap-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md px-2"
            >
              <Trash2 width={16} height={16} /> Delete
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile: add/edit form sheet */}
      <Sheet
        open={!!formSheet}
        onOpenChange={(open) => {
          if (!open) {
            setFormSheet(null);
            cancelEdit();
          }
        }}
      >
        <SheetContent side="bottom" showCloseButton={false} className="gap-1 max-h-[90vh] overflow-y-auto">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-left">
              {formSheet === "edit" ? "Edit Author" : "Add Author"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{authorForm}</div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Author</DialogTitle>
            <DialogDescription>
              Are you sure? Posts assigned to this author will lose their author assignment.
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
    </>
  );
}
