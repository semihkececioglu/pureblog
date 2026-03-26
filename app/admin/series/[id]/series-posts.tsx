"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GripVertical, Trash2, Plus, Search, Save } from "lucide-react";
import { toast } from "sonner";

type SeriesPost = Pick<IPost, "title" | "slug" | "seriesOrder"> & { _id: string };
type AvailablePost = Pick<IPost, "title" | "slug"> & { _id: string };

interface SeriesPostsProps {
  seriesId: string;
  seriesName: string;
  initialSeriesPosts: SeriesPost[];
  allPosts: AvailablePost[];
}

export function SeriesPosts({ seriesId, seriesName, initialSeriesPosts, allPosts }: SeriesPostsProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<SeriesPost[]>(
    initialSeriesPosts.map((p, i) => ({ ...p, seriesOrder: p.seriesOrder ?? i + 1 })),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const inSeriesIds = new Set(posts.map((p) => p._id));

  const filteredAvailable = useMemo(() => {
    const q = search.toLowerCase();
    return allPosts.filter(
      (p) => !inSeriesIds.has(p._id) && p.title.toLowerCase().includes(q),
    );
  }, [allPosts, inSeriesIds, search]);

  function addPost(post: AvailablePost) {
    const nextOrder = posts.length + 1;
    setPosts((prev) => [...prev, { ...post, seriesOrder: nextOrder }]);
    setDirty(true);
  }

  function removePost(id: string) {
    setPosts((prev) => {
      const next = prev.filter((p) => p._id !== id);
      return next.map((p, i) => ({ ...p, seriesOrder: i + 1 }));
    });
    setDirty(true);
  }

  function updateOrder(id: string, value: string) {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      setPosts((prev) => prev.map((p) => p._id === id ? { ...p, seriesOrder: num } : p));
      setDirty(true);
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPosts((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((p, i) => ({ ...p, seriesOrder: i + 1 }));
    });
    setDirty(true);
  }

  function moveDown(index: number) {
    if (index === posts.length - 1) return;
    setPosts((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((p, i) => ({ ...p, seriesOrder: i + 1 }));
    });
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/series/${seriesId}/posts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posts: posts.map((p) => ({ postId: p._id, order: p.seriesOrder ?? 1 })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      toast.success("Series posts saved.");
      router.refresh();
    } else {
      toast.error("Failed to save.");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} in this series
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setSearch(""); setAddOpen(true); }}
            className="flex items-center gap-2"
          >
            <Plus width={14} height={14} />
            Add Post
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2"
          >
            <Save width={14} height={14} />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="border border-dashed border-border py-12 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground text-sm">No posts in this series yet.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setSearch(""); setAddOpen(true); }}
          >
            Add your first post
          </Button>
        </div>
      ) : (
        <div className="flex flex-col border border-border divide-y divide-border">
          {posts.map((post, index) => (
            <div key={post._id} className="flex items-center gap-3 px-4 py-3">
              {/* Drag handle / move buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                  aria-label="Move up"
                >
                  <GripVertical width={14} height={14} className="rotate-90 -mb-1" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === posts.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                  aria-label="Move down"
                >
                  <GripVertical width={14} height={14} className="rotate-90 -mt-1 opacity-0" />
                </button>
              </div>

              {/* Order number */}
              <Input
                type="number"
                min={1}
                value={post.seriesOrder ?? index + 1}
                onChange={(e) => updateOrder(post._id, e.target.value)}
                className="w-14 text-center font-mono text-sm shrink-0"
              />

              {/* Title */}
              <span className="flex-1 min-w-0 text-sm font-medium truncate">
                {post.title}
              </span>

              {/* Remove */}
              <button
                onClick={() => removePost(post._id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                aria-label="Remove from series"
              >
                <Trash2 width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {dirty && (
        <p className="text-xs text-muted-foreground">
          You have unsaved changes.{" "}
          <button onClick={handleSave} className="underline hover:text-foreground">
            Save now
          </button>
        </p>
      )}

      {/* Add post dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add post to &ldquo;{seriesName}&rdquo;</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 border border-border px-3 py-2">
            <Search width={14} height={14} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col max-h-72 overflow-y-auto divide-y divide-border">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {search ? "No matching posts." : "All posts are already in this series."}
              </p>
            ) : (
              filteredAvailable.map((post) => (
                <button
                  key={post._id}
                  onClick={() => { addPost(post); setAddOpen(false); setSearch(""); }}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-left hover:bg-muted transition-colors"
                >
                  <Plus width={14} height={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{post.title}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
