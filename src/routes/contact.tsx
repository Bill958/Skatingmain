import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sk8 Pro Center" },
      { name: "description", content: "Get in touch with Sk8 Pro Center in Nairobi — coaching, shop, and community." },
      { property: "og:title", content: "Contact — Sk8 Pro Center" },
      { property: "og:description", content: "Visit, call, or DM us — we're here for the Nairobi skate community." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Contact</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            Roll <span className="text-gradient-accent">through.</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Questions, bookings, partnerships — we're always around.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid md:grid-cols-2 gap-6">
        {[
          { Icon: MapPin, title: "Visit us", body: "Skatepark Aga Khan Walk, Nairobi", href: "https://maps.google.com/?q=Aga+Khan+Walk+Nairobi" },
          { Icon: Clock, title: "Opening hours", body: "Mon–Sat: 8am – 5pm · Sun: 11am – 6pm", href: "#" },
          { Icon: Phone, title: "Call", body: "+254 707 252 034", href: "tel:+254707252034" },
          { Icon: MessageCircle, title: "WhatsApp", body: "Chat with us instantly", href: "https://wa.me/254707252034" },
          { Icon: Mail, title: "Email", body: "mainsk8procenter@gmail.com", href: "mailto:mainsk8procenter@gmail.com" },
        ].map(({ Icon, title, body, href }) => (
          <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
             className="group flex gap-5 rounded-2xl glass p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
            <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent-gradient">
              <Icon className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-muted-foreground text-sm">{body}</p>
            </div>
          </a>
        ))}

        <div className="md:col-span-2 rounded-2xl overflow-hidden glass shadow-card">
          <iframe
            title="Skatepark Aga Khan Walk"
            src="https://www.google.com/maps?q=Aga+Khan+Walk+Nairobi&output=embed"
            className="w-full h-80 border-0"
            loading="lazy"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
