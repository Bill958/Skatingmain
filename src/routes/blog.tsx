import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Sk8 Pro Center" },
      { name: "description", content: "Skating tips, tricks, gear reviews, and stories from the Nairobi skate scene." },
      { property: "og:title", content: "Blog — Sk8 Pro Center" },
      { property: "og:description", content: "Tips, tricks, and stories from Nairobi's skate community." },
    ],
  }),
  component: BlogPage,
});

type Post = {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_url: string | null; author: string; created_at: string;
};

function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blogs").select("id,title,slug,excerpt,cover_url,author,created_at")
      .eq("published", true).order("created_at", { ascending: false })
      .then(({ data }) => { setPosts((data ?? []) as Post[]); setLoading(false); });
  }, []);

  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Blog</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            Stories from <span className="text-gradient-accent">the rink.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Tips, tricks, gear guides, and tales from skaters who live it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl glass animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center">
            <p className="text-muted-foreground">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id} to="/blog/$slug" params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl glass hover:shadow-glow transition"
              >
                {p.cover_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={p.cover_url} alt={p.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span>·</span><span>{p.author}</span>
                  </div>
                  <h2 className="font-bold text-lg leading-tight group-hover:text-accent transition">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
