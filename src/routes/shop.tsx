import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle, X, Send } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { DEFAULT_PRODUCTS, WHATSAPP_NUMBER, type Product } from "@/data/defaults";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Sk8 Pro Center" },
      { name: "description", content: "Premium skates, guards, helmets, wheels and accessories. Top brands, fair prices, in Nairobi." },
      { property: "og:title", content: "Shop Premium Skate Gear — Sk8 Pro Center" },
      { property: "og:description", content: "Skates, guards, helmets, wheels & more from top brands in Nairobi." },
    ],
  }),
  component: ShopPage,
});

const CATEGORIES = ["All", "Skates", "Guards", "Helmets", "Wheels", "Accessories"];

function ShopPage() {
  const products = useCachedQuery<Product[]>("shop:products", async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error || !data?.length) return DEFAULT_PRODUCTS;
    return data as Product[];
  }, DEFAULT_PRODUCTS);

  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  const filtered = products.filter(p =>
    (cat === "All" || p.category === cat) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <SiteLayout>
      <section className="bg-hero-gradient border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">The Shop</span>
          <h1 className="mt-2 text-4xl md:text-6xl font-bold">
            Gear that <span className="text-gradient-accent">rolls.</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Hand-picked skates, protection, and accessories — built for Nairobi streets.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  cat === c
                    ? "bg-accent-gradient text-accent-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >{c}</button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full md:w-64 rounded-md glass pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center">
            <p className="text-muted-foreground">No products found{q ? ` for "${q}"` : ""}.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} p={p} onOrder={setOrderProduct} />)}
          </div>
        )}
      </section>

      {/* Order modal */}
      {orderProduct && (
        <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
      )}
    </SiteLayout>
  );
}

function ProductCard({ p, onOrder }: { p: Product; onOrder: (p: Product) => void }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl glass shadow-card transition hover:-translate-y-1 hover:shadow-glow">
      <div className="aspect-square overflow-hidden bg-card relative">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">No image</div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
          {p.category}
        </span>
        {p.stock <= 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-highlight/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold leading-tight">{p.name}</h3>
        {p.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gradient-accent">KSh {p.price.toLocaleString()}</span>
          <button
            onClick={() => onOrder(p)}
            disabled={p.stock <= 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-gradient px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Order
          </button>
        </div>
      </div>
    </article>
  );
}

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const waText = encodeURIComponent(
    `Hi Sk8 Pro Center! 👋\n\nI'd like to order:\n*${product.name}* — KSh ${product.price.toLocaleString()}\n\nName: ${name || "(not provided)"}\nPhone: ${phone || "(not provided)"}${note ? `\nNote: ${note}` : ""}`
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  const inputCls = "w-full rounded-md bg-background/60 border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="order-modal-title" className="font-bold text-lg">Order via WhatsApp</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product summary */}
        <div className="flex gap-3 rounded-xl glass p-3 mb-5">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
          )}
          <div>
            <div className="text-xs text-brand uppercase tracking-wider">{product.category}</div>
            <div className="font-semibold text-sm mt-0.5">{product.name}</div>
            <div className="text-accent font-bold mt-0.5">KSh {product.price.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="order-name" className="text-xs uppercase tracking-wider text-muted-foreground">Your name (optional)</label>
            <input id="order-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amani" className={`mt-1 ${inputCls}`} />
          </div>
          <div>
            <label htmlFor="order-phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone (optional)</label>
            <input id="order-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className={`mt-1 ${inputCls}`} />
          </div>
          <div>
            <label htmlFor="order-note" className="text-xs uppercase tracking-wider text-muted-foreground">Notes (size, colour, etc.)</label>
            <textarea id="order-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Any questions or requests…" className={`mt-1 ${inputCls} resize-none`} />
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          This will open WhatsApp with your order details pre-filled so our team can assist you.
        </p>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Continue on WhatsApp
        </a>
      </div>
    </div>
  );
}
