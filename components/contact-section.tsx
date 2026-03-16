import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ContactSection() {
  return (
    <section className="mt-12 pt-12 border-t border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Contact
          </p>
          <h2 className="font-serif text-2xl font-bold mb-1">Let&apos;s Talk</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Have a question, a project idea, or just want to say hello?
          </p>
        </div>

        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 hover:bg-muted px-6 py-3 text-sm font-medium transition-colors shrink-0"
        >
          Send a Message
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
