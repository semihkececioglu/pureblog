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
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { CornerDownRight } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

type FormData = z.infer<typeof schema>;

interface CommentNode extends Omit<IComment, '_id' | 'parentCommentId'> {
  _id: string;
  parentCommentId?: string;
  replies: CommentNode[];
}

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

function buildTree(comments: CommentNode[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const c of comments) map.set(String(c._id), { ...c, replies: [] });
  for (const c of map.values()) {
    if (c.parentCommentId) {
      const parent = map.get(String(c.parentCommentId));
      if (parent) {
        parent.replies.push(c);
      } else {
        roots.push(c);
      }
    } else {
      roots.push(c);
    }
  }
  return roots;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const cls =
    size === "sm"
      ? "w-7 h-7 text-[10px]"
      : "w-9 h-9 text-xs";
  return (
    <div className={`${cls} shrink-0 rounded-full bg-muted flex items-center justify-center font-mono font-bold select-none`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReplyForm({
  slug,
  parentCommentId,
  replyingTo,
  onDone,
}: {
  slug: string;
  parentCommentId: string;
  replyingTo: string;
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, parentCommentId }),
    });
    reset();
    onDone();
  }

  return (
    <div className="mt-3 rounded-sm border border-border bg-muted/30 p-3">
      <p className="font-mono text-xs text-muted-foreground mb-3">
        Replying to <span className="text-foreground font-semibold">{replyingTo}</span>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Input placeholder="Your name" autoFocus {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Input type="email" placeholder="your@email.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Textarea rows={2} placeholder="Write a reply..." {...register("content")} />
          {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Post reply"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function CommentItem({
  comment,
  slug,
  depth = 0,
}: {
  comment: CommentNode;
  slug: string;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [replySubmitted, setReplySubmitted] = useState(false);
  const isReply = depth > 0;

  return (
    <div id={comment._id} className={isReply ? "" : "py-5 border-b border-border last:border-0"}>
      <div className="flex gap-3">
        <Avatar name={comment.name} size={isReply ? "sm" : "md"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`${isReply ? "text-xs" : "text-sm"} font-medium`}>
              {comment.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {relativeDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>

          {!replySubmitted && (
            <button
              onClick={() => setReplying((p) => !p)}
              className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              {replying ? "Cancel" : "Reply"}
            </button>
          )}

          {replying && !replySubmitted && (
            <ReplyForm
              slug={slug}
              parentCommentId={comment._id}
              replyingTo={comment.name}
              onDone={() => {
                setReplying(false);
                setReplySubmitted(true);
              }}
            />
          )}

          {replySubmitted && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Reply submitted — awaiting moderation.
            </p>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-3 ml-9 pl-4 border-l-2 border-border flex flex-col gap-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} slug={slug} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ slug }: CommentSectionProps) {
  const [tree, setTree] = useState<CommentNode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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
      .then((res) => {
        const flat = (res.data ?? []) as CommentNode[];
        setTotalCount(flat.length);
        setTree(buildTree(flat));
        const hash = window.location.hash.slice(1);
        if (hash) {
          setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      });
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
    <section className="mt-16">
      <div
        className="relative h-2 overflow-hidden border-y border-border mb-8"
        style={{
          width: "min(100vw, 48rem)",
          marginLeft: "calc((min(100vw, 48rem) - min(100vw, 42rem)) * -0.5 - 1rem)",
        }}
      >
        <StripedPattern direction="right" className="text-border" />
      </div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold">Comments</h2>
        {totalCount > 0 && (
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {totalCount} comment{totalCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {tree.length > 0 && (
        <div className="flex flex-col mb-12">
          {tree.map((comment) => (
            <CommentItem key={comment._id} comment={comment} slug={slug} />
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
              <Input id="name" placeholder="Your name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea id="content" rows={4} placeholder="Share your thoughts..." {...register("content")} />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      )}
    </section>
  );
}
