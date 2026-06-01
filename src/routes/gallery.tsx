import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Sk8 Pro Center" },
      { name: "description", content: "Photos and videos from sessions, events, and the Nairobi skate scene." },
      { property: "og:title", content: "Gallery — Sk8 Pro Center" },
      { property: "og:description", content: "Sessions, events, and the Nairobi skate scene in photos and video." },
    ],
  }),
  component: GalleryPage,
});

type Item = { id: string; title: string | null; media_url: string; media_type: "image" | "video" };

function GalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data ?? []) as Item[]); setLoading(false); });
  }, []);

  const active = activeIdx !== null ? items[activeIdx] : null;

  const close = useCallback(() => setActiveIdx(null), []);
  const prev = useCallback(() => setActiveIdx((i) => (i !== null ? (i - 1 + items.length) % items.length : null)), [items.length]);
  const next = useCallback(() => setActiveIdx((i) => (i !== null ? (i + 1) % items.length : null)), [items.length]);

  useEffect(() => {
    if (activeIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, close, prev, next]);

  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Gallery</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            Moments on <span className="text-gradient-accent">eight wheels.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl glass animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center">
            <p className="text-muted-foreground">Gallery is empty — admins can upload photos and videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((it, idx) => (
              <button
                key={it.id}
                onClick={() => setActiveIdx(idx)}
                className="group relative aspect-square overflow-hidden rounded-xl glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={it.title ?? `Gallery item ${idx + 1}`}
              >
                {it.media_type === "image" ? (
                  <img src={it.media_url} alt={it.title ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <video src={it.media_url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 grid place-items-center bg-black/30">
                      <Play className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                  </>
                )}
                {/* Caption overlay on hover */}
                {it.title && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-xs text-white font-medium truncate">{it.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title ?? "Gallery viewer"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {(activeIdx ?? 0) + 1} / {items.length}
          </div>

          {/* Prev */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Media */}
          <div className="max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            {active.media_type === "image" ? (
              <img src={active.media_url} alt={active.title ?? ""} className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
            ) : (
              <video src={active.media_url} controls autoPlay className="w-full max-h-[80vh] rounded-xl" />
            )}
            {active.title && (
              <p className="mt-3 text-center text-sm text-white/70">{active.title}</p>
            )}
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </SiteLayout>
  );
}
