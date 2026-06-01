import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, X, Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MediaManager } from "@/components/admin/media-manager";
import { ConfirmDialog, useConfirm } from "@/components/confirm-dialog";

type Service = {
  id: string; title: string; description: string | null;
  price: string | null; sort_order: number;
};

const empty = { title: "", description: "", price: "", sort_order: 0 };

export function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const { confirmState, confirm, close } = useConfirm();

  const load = () => supabase.from("services").select("*").order("sort_order")
    .then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  function handleDelete(s: Service) {
    confirm(
      `Delete "${s.title}"?`,
      "This service will be permanently removed from the site.",
      async () => {
        const { error } = await supabase.from("services").delete().eq("id", s.id);
        if (error) return toast.error(error.message);
        toast.success("Deleted");
        load();
        close();
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Services <span className="text-muted-foreground text-sm font-normal">({items.length})</span></h2>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow">
          <Plus className="h-4 w-4" /> New service
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No services yet.</p>
          <button onClick={() => setEditing(empty)} className="mt-3 text-sm text-accent hover:underline">Add your first service →</button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className="rounded-xl glass p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/50 font-mono">#{s.sort_order}</span>
                    <h3 className="font-semibold">{s.title}</h3>
                    {s.price && <span className="text-xs text-brand">{s.price}</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(s)} className="p-1.5 rounded hover:bg-accent/20 text-muted-foreground hover:text-accent" aria-label={`Edit ${s.title}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s)} className="p-1.5 rounded hover:bg-highlight/20 text-muted-foreground hover:text-highlight" aria-label={`Delete ${s.title}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ServiceModal initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

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

function ServiceModal({ initial, onClose, onSaved }: { initial: Partial<Service>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Service>>(initial);
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.title) return toast.error("Title required");
    setBusy(true);
    const payload = {
      title: form.title!, description: form.description ?? null,
      price: form.price ?? null, sort_order: Number(form.sort_order ?? 0),
    };
    const res = form.id
      ? await supabase.from("services").update(payload).eq("id", form.id)
      : await supabase.from("services").insert(payload);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved"); onSaved();
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
        aria-labelledby="service-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="service-modal-title" className="text-lg font-bold">{form.id ? "Edit" : "New"} service</h3>
          <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="svc-title" className="text-xs uppercase tracking-wider text-muted-foreground">Title</label>
            <input id="svc-title" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`mt-1 ${cls}`} required />
          </div>
          <div>
            <label htmlFor="svc-desc" className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea id="svc-desc" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={`mt-1 ${cls}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="svc-price" className="text-xs uppercase tracking-wider text-muted-foreground">Price (text)</label>
              <input id="svc-price" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. KSh 2,000/hr" className={`mt-1 ${cls}`} />
            </div>
            <div>
              <label htmlFor="svc-order" className="text-xs uppercase tracking-wider text-muted-foreground">Sort order</label>
              <input id="svc-order" type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className={`mt-1 ${cls}`} />
            </div>
          </div>
          {form.id && <MediaManager entityType="service" entityId={form.id} />}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md glass px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
