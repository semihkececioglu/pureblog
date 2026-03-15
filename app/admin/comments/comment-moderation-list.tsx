"use client";

import { useState } from "react";
import { IComment } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface CommentModerationListProps {
  initialComments: (IComment & { _id: string })[];
}

export function CommentModerationList({ initialComments }: CommentModerationListProps) {
  const [comments, setComments] = useState(initialComments);

  async function updateStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setComments((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status } : c))
    );
  }

  const pending = comments.filter((c) => c.status === "pending");
  const rest = comments.filter((c) => c.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      {pending.length > 0 && (
        <div>
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Pending ({pending.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map((comment) => (
              <CommentRow key={comment._id} comment={comment} onUpdate={updateStatus} />
            ))}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Reviewed ({rest.length})
          </h2>
          <div className="flex flex-col gap-3">
            {rest.map((comment) => (
              <CommentRow key={comment._id} comment={comment} onUpdate={updateStatus} />
            ))}
          </div>
        </div>
      )}
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  onUpdate,
}: {
  comment: IComment & { _id: string };
  onUpdate: (id: string, status: "approved" | "rejected") => void;
}) {
  return (
    <div className="border border-border p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{comment.email}</span>
          <span
            className={`font-mono text-xs uppercase tracking-widest ${
              comment.status === "approved"
                ? "text-foreground"
                : comment.status === "rejected"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {comment.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
      </div>
      {comment.status === "pending" && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            aria-label="Approve"
            onClick={() => onUpdate(comment._id, "approved")}
          >
            <Check width={16} height={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reject"
            onClick={() => onUpdate(comment._id, "rejected")}
          >
            <X width={16} height={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
