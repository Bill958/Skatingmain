import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Star, Quote } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Sk8 Pro Center" },
      { name: "description", content: "Read what skaters say about Sk8 Pro Center, and share your own story." },
      { property: "og:title", content: "Testimonials — Sk8 Pro Center" },
      { property: "og:description", content: "Hear from the Nairobi skate community and share your own story." },
    ],
  }),
  component: TestimonialsPage,
});

type Testimonial = { id: string; name: string; message: string; rating: number | null };

function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    supabase.from("testimonials").select("id,name,message,rating").eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  };
  useEffect(load, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || message.trim().length < 5) {
      toast.error("Please add your name and a short message.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      name: name.trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
      rating,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't submit — please try again.");
    } else {
      toast.success("Thanks! Your testimonial is pending approval.");
      setName(""); setMessage(""); setRating(5);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Community</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            Voices from <span className="text-gradient-accent">the streets.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center">
              <p className="text-muted-foreground">No approved testimonials yet — be the first.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {items.map((t) => (
                <article key={t.id} className="rounded-2xl glass p-6 shadow-card">
                  <Quote className="h-8 w-8 text-accent/40" />
                  <p className="mt-3 text-sm leading-relaxed">{t.message}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-sm">— {t.name}</span>
                    {t.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl glass p-6 shadow-card h-fit sticky top-24">
          <h2 className="text-xl font-bold">Share your story</h2>
          <p className="mt-1 text-sm text-muted-foreground">All submissions are reviewed by an admin before going public.</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
                className="mt-1 w-full rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Rating</label>
              <div className="mt-1 flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)}>
                    <Star className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={5}
                className="mt-1 w-full rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="What's your Sk8 Pro story?"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full rounded-md bg-accent-gradient px-4 py-2.5 font-semibold text-accent-foreground shadow-glow disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit testimonial"}
            </button>
          </form>
        </aside>
      </section>
    </SiteLayout>
  );
}
