import { useEffect, useState } from "react";
import { Package, Wrench, Image as ImageIcon, MessageSquare, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TabId = "dashboard" | "products" | "services" | "gallery" | "blogs" | "testimonials";

type Stats = {
  products: number;
  lowStock: number;
  services: number;
  gallery: number;
  blogs: number;
  pendingTestimonials: number;
  approvedTestimonials: number;
};

export function AdminDashboard({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [products, services, gallery, blogs, pendingT, approvedT] = await Promise.all([
        supabase.from("products").select("id,stock"),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("gallery_items").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      setStats({
        products: products.data?.length ?? 0,
        lowStock: products.data?.filter((p) => p.stock <= 2).length ?? 0,
        services: services.count ?? 0,
        gallery: gallery.count ?? 0,
        blogs: blogs.count ?? 0,
        pendingTestimonials: pendingT.count ?? 0,
        approvedTestimonials: approvedT.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = stats
    ? [
        {
          label: "Products",
          value: stats.products,
          icon: Package,
          color: "text-accent",
          bg: "bg-accent/10",
          tab: "products" as TabId,
          sub: stats.lowStock > 0 ? `${stats.lowStock} low stock` : "All stocked",
          subColor: stats.lowStock > 0 ? "text-highlight" : "text-brand",
        },
        {
          label: "Services",
          value: stats.services,
          icon: Wrench,
          color: "text-brand",
          bg: "bg-brand/10",
          tab: "services" as TabId,
          sub: "Active offerings",
          subColor: "text-muted-foreground",
        },
        {
          label: "Gallery items",
          value: stats.gallery,
          icon: ImageIcon,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
          tab: "gallery" as TabId,
          sub: "Photos & videos",
          subColor: "text-muted-foreground",
        },
        {
          label: "Blog posts",
          value: stats.blogs,
          icon: FileText,
          color: "text-sky-400",
          bg: "bg-sky-400/10",
          tab: "blogs" as TabId,
          sub: "Published articles",
          subColor: "text-muted-foreground",
        },
        {
          label: "Pending reviews",
          value: stats.pendingTestimonials,
          icon: MessageSquare,
          color: stats.pendingTestimonials > 0 ? "text-highlight" : "text-muted-foreground",
          bg: stats.pendingTestimonials > 0 ? "bg-highlight/10" : "bg-muted/30",
          tab: "testimonials" as TabId,
          sub: `${stats.approvedTestimonials} approved`,
          subColor: "text-brand",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl glass animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Click any card to jump to that section.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, color, bg, tab, sub, subColor }) => (
          <button
            key={label}
            onClick={() => onTabChange(tab)}
            className="group text-left rounded-2xl glass p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
            <div className={`text-xs mt-1 ${subColor}`}>{sub}</div>
          </button>
        ))}
      </div>

      {stats && stats.lowStock > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-highlight/30 bg-highlight/10 p-4">
          <AlertTriangle className="h-5 w-5 text-highlight flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-highlight">Low stock alert</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.lowStock} product{stats.lowStock !== 1 ? "s" : ""} ha{stats.lowStock !== 1 ? "ve" : "s"} 2 or fewer units left.{" "}
              <button onClick={() => onTabChange("products")} className="underline hover:text-foreground">Review products →</button>
            </p>
          </div>
        </div>
      )}

      {stats && stats.pendingTestimonials > 0 && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-accent">Reviews awaiting approval</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.pendingTestimonials} testimonial{stats.pendingTestimonials !== 1 ? "s" : ""} need{stats.pendingTestimonials === 1 ? "s" : ""} your review.{" "}
              <button onClick={() => onTabChange("testimonials")} className="underline hover:text-foreground">Approve now →</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
