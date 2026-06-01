import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, Wrench, Image as ImageIcon, MessageSquare, Home, FileText, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ProductsAdmin } from "@/components/admin/products-admin";
import { ServicesAdmin } from "@/components/admin/services-admin";
import { GalleryAdmin } from "@/components/admin/gallery-admin";
import { TestimonialsAdmin } from "@/components/admin/testimonials-admin";
import { BlogsAdmin } from "@/components/admin/blogs-admin";
import { AdminDashboard } from "@/components/admin/dashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Sk8 Pro Center" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "products", label: "Products", Icon: Package },
  { id: "services", label: "Services", Icon: Wrench },
  { id: "gallery", label: "Gallery", Icon: ImageIcon },
  { id: "blogs", label: "Blog", Icon: FileText },
  { id: "testimonials", label: "Testimonials", Icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]["id"];

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  const refreshPending = () => {
    supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));
  };
  useEffect(() => { if (isAdmin) refreshPending(); }, [isAdmin, tab]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-sm">Loading admin…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="font-bold">Sk8 <span className="text-gradient-accent">Admin</span></span>
            <span className="hidden sm:inline text-xs text-muted-foreground">· {user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 rounded-md glass px-3 py-2 text-sm hover:text-accent">
              <Home className="h-4 w-4" /> <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
              className="inline-flex items-center gap-2 rounded-md glass px-3 py-2 text-sm hover:text-highlight"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl w-full px-4 md:px-6 py-6 flex-1">
        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-border/40">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id} onClick={() => setTab(id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition rounded-t-md ${
                tab === id ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {id === "testimonials" && pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-highlight px-1.5 text-[10px] font-bold text-white">{pendingCount}</span>
              )}
              {tab === id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <AdminDashboard onTabChange={setTab} />}
        {tab === "products" && <ProductsAdmin />}
        {tab === "services" && <ServicesAdmin />}
        {tab === "gallery" && <GalleryAdmin />}
        {tab === "blogs" && <BlogsAdmin />}
        {tab === "testimonials" && <TestimonialsAdmin onChange={refreshPending} />}
      </div>
    </div>
  );
}
