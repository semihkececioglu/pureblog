"use client";

import { useState } from "react";
import { IMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { MailOpen } from "lucide-react";

interface MessageListProps {
  initialMessages: (IMessage & { _id: string })[];
}

export function MessageList({ initialMessages }: MessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function markAsRead(id: string): Promise<void> {
    await fetch(`/api/admin/messages/${id}/read`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        messages.map((message) => (
          <div
            key={message._id}
            className={`border p-4 cursor-pointer transition-colors ${
              message.read ? "border-border" : "border-foreground"
            }`}
            onClick={() => setExpanded(expanded === message._id ? null : message._id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{message.email}</span>
                  {!message.read && (
                    <span className="font-mono text-xs text-foreground uppercase tracking-widest">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{message.subject}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
                {!message.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Mark as read"
                    onClick={(e) => { e.stopPropagation(); markAsRead(message._id); }}
                  >
                    <MailOpen width={16} height={16} />
                  </Button>
                )}
              </div>
            </div>
            {expanded === message._id && (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                {message.content}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
