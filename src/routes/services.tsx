import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Users, Wrench, Calendar, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Sk8 Pro Center" },
      { name: "description", content: "Skate coaching, rentals, repairs, and community sessions in Nairobi." },
      { property: "og:title", content: "Services — Sk8 Pro Center" },
      { property: "og:description", content: "Coaching, rentals, repairs, and skate sessions in Nairobi." },
    ],
  }),
  component: ServicesPage,
});

type Service = { id: string; title: string; description: string | null; price: string | null; image_url: string | null };

const ICONS = [GraduationCap, Users, Wrench, Calendar];

function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order")
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const list = items.length ? items : DEFAULTS;

  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Services</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            From first push to <span className="text-gradient-accent">pro tricks.</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Whether you're stepping on for the first time or chasing your next line — we've got you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl glass h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {list.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={s.id} className="group flex gap-5 rounded-2xl glass p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="flex-shrink-0">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gradient">
                      <Icon className="h-7 w-7 text-accent-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold">{s.title}</h3>
                      {s.price && <span className="text-sm font-semibold text-brand whitespace-nowrap">{s.price}</span>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                    <a
                      href="https://wa.me/254700000000"
                      target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all"
                    >
                      Book now <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

const DEFAULTS: Service[] = [
  { id: "1", title: "1-on-1 Coaching", description: "Private lessons tailored to your level. Beginner basics through advanced tricks.", price: "From KSh 2,000/hr", image_url: null },
  { id: "2", title: "Group Sessions", description: "Weekly group classes — meet skaters, learn together, save on rates.", price: "From KSh 800/person", image_url: null },
  { id: "3", title: "Skate Rentals", description: "Quality inline skates and protective gear available by the hour or day.", price: "From KSh 500/hr", image_url: null },
  { id: "4", title: "Repairs & Maintenance", description: "Bearing swaps, wheel rotations, brake fixes — keep your gear rolling smooth.", price: "From KSh 300", image_url: null },
];
