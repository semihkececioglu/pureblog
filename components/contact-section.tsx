import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function ContactSection() {
  return (
    <section className="mt-2 pt-12">
      <div className="relative h-2 overflow-hidden border-y border-border mb-12 -mx-4">
        <StripedPattern direction="right" className="text-border" />
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Contact
          </p>
          <h2 className="font-serif text-2xl font-bold mb-1">
            Let&apos;s Talk
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Have a question, a project idea, or just want to say hello?
          </p>
        </div>

        <Link href="/contact" className="shrink-0">
          <ShimmerButton className="px-5 py-2 text-sm">
            Send a Message
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </ShimmerButton>
        </Link>
      </div>
    </section>
  );
}
