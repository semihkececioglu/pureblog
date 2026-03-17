"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StripedPattern } from "@/components/magicui/striped-pattern";

const NEWSLETTER_IMAGE =
  "https://wallpapermural.com/cdn/shop/products/Vase_of_Flower_Artwork.jpg?v=1750700675";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "duplicate"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="pt-0">
      <div className="relative h-2 overflow-hidden border-y border-border mb-12  -mx-4">
        <StripedPattern direction="right" className="text-border" />
      </div>
      <div className="rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-muted/40 border border-border">
        {/* Left — content */}
        <div className="flex flex-col justify-center p-8 md:p-10">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Newsletter
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2 leading-snug">
            Stay Updated
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            New posts delivered to your inbox.
            <br />
            No spam, ever.
          </p>

          {status === "success" ? (
            <div className="rounded-xl bg-background border border-border px-4 py-3 inline-flex items-center gap-2">
              <span className="text-sm font-medium">
                You&apos;re subscribed!
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
                className="bg-background"
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </Button>
            </form>
          )}

          {status === "duplicate" && (
            <p className="text-xs text-muted-foreground mt-2">
              Already subscribed with this email.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive mt-2">
              Something went wrong. Please try again.
            </p>
          )}
        </div>

        {/* Right — image */}
        <div className="relative hidden md:block min-h-[280px]">
          <Image
            src={NEWSLETTER_IMAGE}
            alt="Newsletter illustration"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>
    </section>
  );
}
