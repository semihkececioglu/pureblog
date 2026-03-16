import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with us.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
        Contact
      </h1>
      <p className="text-muted-foreground mb-12">
        Have a question or just want to say hello? Send a message.
      </p>
      <ContactForm />
    </div>
  );
}
