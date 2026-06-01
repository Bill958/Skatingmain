import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, X, Star, Upload, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";
import { MediaManager } from "@/components/admin/media-manager";
import { ConfirmDialog, useConfirm } from "@/components/confirm-dialog";

type Product = {
  id: string; name: string; description: string | null; price: number;
  category: string; image_url: string | null; stock: number; featured: boolean;
};

const CATEGORIES = ["Skates", "Guards", "Helmets", "Wheels", "Accessories"];
const empty = { name: "", description: "", price: 0, category: "Skates", image_url: "", stock: 0, featured: false };

export function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [q, setQ] = useState("");
  const { confirmState, confirm, close } = useConfirm();

  const load = () => supabase.from("products").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(p =>
    q === "" ||
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );

  function handleDelete(p: Product) {
    confirm(
      `Delete "${p.name}"?`,
      "This action cannot be undone. The product will be permanently removed.",
      async () => {
        const { error } = await supabase.from("products").delete().eq("id", p.id);
        if (error) return toast.error(error.message);
        toast.success("Deleted");
        load();
        close();
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h2 className="text-xl font-bold">
          Products <span className="text-muted-foreground text-sm font-normal">({items.length})</span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="rounded-md glass pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent w-44"
            />
          </div>
          <button
            onClick={() => setEditing(empty)}
            className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> New product
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No products yet.</p>
          <button onClick={() => setEditing(empty)} className="mt-3 text-sm text-accent hover:underline">Add your first product →</button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No products match "{q}".</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-xl glass p-3 shadow-card">
              <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-card overflow-hidden">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {p.featured && <Star className="h-3.5 w-3.5 fill-accent text-accent flex-shrink-0" />}
                      <h3 className="font-semibold truncate text-sm">{p.name}</h3>
                    </div>
                    <div className="text-xs text-brand">{p.category}</div>
                    <div className="text-sm font-bold text-accent mt-0.5">KSh {p.price.toLocaleString()}</div>
                    <div className={`text-xs mt-0.5 ${p.stock <= 2 ? "text-highlight font-medium" : "text-muted-foreground"}`}>
                      Stock: {p.stock}{p.stock <= 2 && p.stock > 0 ? " (low)" : p.stock === 0 ? " (out)" : ""}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-accent/20 text-muted-foreground hover:text-accent" aria-label={`Edit ${p.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded hover:bg-highlight/20 text-muted-foreground hover:text-highlight" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ProductModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        onCancel={close}
      />
    </div>
  );
}

function ProductModal({ initial, onClose, onSaved }: { initial: Partial<Product>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Product>>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadMedia(file, "products");
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error("Name required");
    setBusy(true);
    const payload = {
      name: form.name!,
      description: form.description ?? null,
      price: Number(form.price ?? 0),
      category: form.category ?? "Skates",
      image_url: form.image_url || null,
      stock: Number(form.stock ?? 0),
      featured: form.featured ?? false,
    };
    const res = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    onSaved();
  }

  const cls = "w-full rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4 overflow-y-auto" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-card my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="product-modal-title" className="text-lg font-bold">{form.id ? "Edit" : "New"} product</h3>
          <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="prod-name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
            <input id="prod-name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${cls}`} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prod-price" className="text-xs uppercase tracking-wider text-muted-foreground">Price (KSh)</label>
              <input id="prod-price" type="number" min="0" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: +e.target.value })} className={`mt-1 ${cls}`} />
            </div>
            <div>
              <label htmlFor="prod-stock" className="text-xs uppercase tracking-wider text-muted-foreground">Stock</label>
              <input id="prod-stock" type="number" min="0" value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className={`mt-1 ${cls}`} />
            </div>
          </div>
          <div>
            <label htmlFor="prod-category" className="text-xs uppercase tracking-wider text-muted-foreground">Category</label>
            <select id="prod-category" value={form.category ?? "Skates"} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`mt-1 ${cls}`}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="prod-desc" className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea id="prod-desc" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`mt-1 ${cls}`} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Image</span>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md glass px-3 py-2 text-sm hover:text-accent transition-colors">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : form.image_url ? "Replace" : "Upload"}
                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
              {form.image_url && (
                <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-muted-foreground hover:text-highlight">Remove</button>
              )}
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[oklch(0.72_0.19_40)]" />
            Featured on homepage
          </label>
          {form.id && <MediaManager entityType="product" entityId={form.id} />}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md glass px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={busy || uploading} className="rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
