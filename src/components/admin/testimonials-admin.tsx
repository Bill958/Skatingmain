import { useEffect, useState } from "react";
import { Check, X, Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog, useConfirm } from "@/components/confirm-dialog";

type Testimonial = {
  id: string; name: string; message: string;
  rating: number | null; status: "pending" | "approved" | "rejected";
  created_at: string;
};

const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

export function TestimonialsAdmin({ onChange }: { onChange?: () => void }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<typeof FILTERS[number]["id"]>("pending");
  const { confirmState, confirm, close } = useConfirm();

  const load = () => supabase.from("testimonials").select("*").eq("status", filter)
    .order("created_at", { ascending: false })
    .then(({ data }) => setItems((data ?? []) as Testimonial[]));
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id: string, status: Testimonial["status"]) {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Approved" : "Rejected");
    load(); onChange?.();
  }

  function handleDelete(t: Testimonial) {
    confirm(
      `Delete review by ${t.name}?`,
      "This testimonial will be permanently removed and cannot be recovered.",
      async () => {
        const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
        if (error) return toast.error(error.message);
        toast.success("Deleted");
        load();
        onChange?.();
        close();
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h2 className="text-xl font-bold">Testimonials</h2>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === f.id ? "bg-accent-gradient text-accent-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === "pending" ? "No reviews awaiting approval." : filter === "approved" ? "No approved testimonials yet." : "No rejected reviews."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} className="rounded-xl glass p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{t.name}</span>
                    {t.rating && (
                      <span className="flex gap-0.5" aria-label={`${t.rating} stars`}>
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t.message}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 justify-end flex-wrap">
                {filter !== "approved" && (
                  <button
                    onClick={() => setStatus(t.id, "approved")}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-brand-foreground"
                  >
                    <Check className="h-3 w-3" /> Approve
                  </button>
                )}
                {filter !== "rejected" && (
                  <button
                    onClick={() => setStatus(t.id, "rejected")}
                    className="inline-flex items-center gap-1 rounded-md glass px-3 py-1.5 text-xs font-semibold hover:text-highlight"
                  >
                    <X className="h-3 w-3" /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(t)}
                  className="inline-flex items-center gap-1 rounded-md glass px-3 py-1.5 text-xs font-semibold hover:text-highlight"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
