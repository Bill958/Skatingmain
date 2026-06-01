import { createFileRoute, Link } from "@tanstack/react-router";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { ArrowRight, ShoppingBag, GraduationCap, Users, Star, Quote, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import skatingVideo from "@/assets/skating.mp4";
import heroImg from "@/assets/img.jpg";
import { DEFAULT_PRODUCTS, DEFAULT_SERVICES, DEFAULT_TESTIMONIALS, type Product, type Service, type Testimonial } from "@/data/defaults";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sk8 Pro Center — Premium Skateboarding in Nairobi" },
      { name: "description", content: "Gear, coaching, and community for skaters in Nairobi. Shop premium skates, guards, helmets and wheels." },
      { property: "og:title", content: "Sk8 Pro Center — Premium Skateboarding in Nairobi" },
      { property: "og:description", content: "Gear, coaching, and community for skaters in Nairobi." },
    ],
  }),
  component: HomePage,
});


function HomePage() {
  const products = useCachedQuery<Product[]>("home:products", async () => {
    const { data } = await supabase.from("products").select("id,name,price,image_url,category").eq("featured", true).limit(4);
    return data ?? [];
  }, []);
  const services = useCachedQuery<Service[]>("home:services", async () => {
    const { data } = await supabase.from("services").select("id,title,description,icon").order("sort_order").limit(3);
    return data ?? [];
  }, []);
  const testimonials = useCachedQuery<Testimonial[]>("home:testimonials", async () => {
    const { data } = await supabase.from("testimonials").select("id,name,message,rating").eq("status", "approved").limit(6);
    return data ?? [];
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 opacity-30">
          <img
            src={heroImg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover md:hidden"
          />
          <video
            loop muted playsInline autoPlay
            preload="none"
            className="hidden md:block h-full w-full object-cover"
            poster={heroImg}
          >
            <source src={skatingVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-brand uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              Nairobi's rolling home · Since 2020
            </span>
            <h1 className="mt-6 text-4xl md:text-7xl font-bold leading-[1.05]">
              Skate like you <span className="text-gradient-accent">mean it</span>.<br />
              Every push, every trick, every session.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Step into Nairobi's skate culture with premium gear, real coaching, repairs, school programs,
              and a crew that keeps every session electric.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-6 py-3 font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-105">
                Shop Gear <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-md glass px-6 py-3 font-semibold hover:bg-accent/10">
                Book a Lesson
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {["Inline skates", "Skateboards", "Rollerblades", "Repairs", "School programs"].map((item) => (
                <span key={item} className="rounded-full border border-border bg-card/50 px-3 py-1.5">{item}</span>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[["500+", "Skaters trained"], ["50+", "Premium products"], ["2020", "Community born"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl md:text-3xl font-bold text-gradient-accent">{n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative">
            <img
              src={heroImg}
              alt="Sk8 Pro Center community in Nairobi"
              className="rounded-3xl shadow-card object-cover aspect-[4/5] w-full"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl bg-accent-gradient p-5 shadow-glow">
              <div className="text-3xl font-bold text-accent-foreground">2020</div>
              <div className="text-xs text-accent-foreground/80 uppercase tracking-wider">Since</div>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Our Story</span>
            <h2 className="mt-2 text-3xl md:text-5xl font-bold leading-tight">
              Building Nairobi's <span className="text-gradient-accent">Skate Community</span> Since 2020
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              At Main Sk8 Pro Center, we're more than just a skate shop — we're Nairobi's premier hub
              for inline skating, skateboarding, and rollerblading culture.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Expert coaching for all skill levels, from beginners to pros",
                "Comprehensive school programs promoting active lifestyles",
                "Premium equipment sales and professional repair services",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-105">
                Explore services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-md glass px-5 py-2.5 text-sm font-semibold hover:bg-accent/10">
                Visit the shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <SectionHeader eyebrow="What we do" title="Built for every skater" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Learn", "Start confident with safe, step-by-step coaching."],
            ["Ride", "Pick gear that fits your style and skill level."],
            ["Belong", "Join street sessions, school programs, and community rolls."],
          ].map(([title, copy], index) => (
            <div key={title} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-sm font-semibold text-accent">0{index + 1}</div>
              <h3 className="mt-2 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-3 mt-10">
          {(services.length ? services : DEFAULT_SERVICES).map((s, i) => {
            const Icon = [GraduationCap, ShoppingBag, Users][i % 3];
            return (
              <div key={s.id ?? i} className="group rounded-2xl glass p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient mb-4">
                  <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all">
            All services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <SectionHeader eyebrow="Hot drops" title="Featured gear" inline />
          <Link to="/shop" className="text-sm font-medium text-accent hover:underline">Shop all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(products.length ? products : DEFAULT_PRODUCTS).map((p) => <ProductMini key={p.id} p={p} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <SectionHeader eyebrow="The community" title="What skaters say" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {(testimonials.length ? testimonials.slice(0, 3) : DEFAULT_TESTIMONIALS).map((t) => (
            <div key={t.id} className="rounded-2xl glass p-6 shadow-card">
              <Quote className="h-8 w-8 text-accent/40" />
              <p className="mt-3 text-sm leading-relaxed">{t.message}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-semibold text-sm">{t.name}</span>
                {t.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/testimonials" className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all">
            Share your story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <div className="rounded-3xl bg-accent-gradient p-10 md:p-16 text-center shadow-glow">
          <h2 className="text-3xl md:text-5xl font-bold text-accent-foreground">Ready to roll?</h2>
          <p className="mt-3 text-accent-foreground/80 max-w-xl mx-auto">
            Visit the shop, book a session, or just come hang. The crew's waiting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="rounded-md bg-background px-6 py-3 font-semibold text-foreground hover:bg-card">Get in touch</Link>
            <Link to="/shop" className="rounded-md border-2 border-background/30 px-6 py-3 font-semibold text-accent-foreground hover:bg-background/10">Browse shop</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeader({ eyebrow, title, inline }: { eyebrow: string; title: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : "text-center"}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
      <h2 className="mt-2 text-3xl md:text-4xl font-bold">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-muted-foreground text-sm">
      {text}
    </div>
  );
}

function ProductMini({ p }: { p: Product }) {
  return (
    <Link
      to="/shop"
      className="group block overflow-hidden rounded-2xl glass shadow-card transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="aspect-square overflow-hidden bg-card">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">No image</div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs uppercase tracking-wider text-brand">{p.category}</div>
        <div className="mt-1 font-semibold truncate">{p.name}</div>
        <div className="mt-1 text-accent font-bold">KSh {p.price.toLocaleString()}</div>
      </div>
    </Link>
  );
}

