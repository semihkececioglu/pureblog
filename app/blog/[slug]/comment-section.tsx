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
      <h2 className="font-serif text-2xl font-bold mb-8">Comments</h2>

      {comments.length > 0 && (
        <div className="flex flex-col gap-6 mb-12">
          {comments.map((comment) => (
            <div key={String(comment._id)} className="border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{comment.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <p className="text-sm text-muted-foreground">
          Your comment has been submitted and is awaiting approval.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea id="content" rows={4} {...register("content")} />
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
