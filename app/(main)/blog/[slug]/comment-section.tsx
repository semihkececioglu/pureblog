"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IComment } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  content: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000),
});

type FormData = z.infer<typeof schema>;

interface CommentSectionProps {
  slug: string;
}

function relativeDate(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch(`/api/posts/${slug}/comments`)
      .then((res) => res.json())
      .then((res) => setComments(res.data ?? []));
  }, [slug]);

  async function onSubmit(data: FormData): Promise<void> {
    await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    reset();
    setSubmitted(true);
  }

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold">Comments</h2>
        {comments.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {comments.length > 0 && (
        <div className="flex flex-col mb-12">
          {comments.map((comment) => (
            <div
              key={String(comment._id)}
              className="flex gap-4 py-5 border-b border-border last:border-0"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-muted flex items-center justify-center font-mono text-xs font-bold select-none">
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {relativeDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <div className="rounded-xl p-4 bg-muted">
          <p className="text-sm">Comment submitted — awaiting moderation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea
              id="content"
              rows={4}
              placeholder="Share your thoughts..."
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      )}
    </section>
  );
}
