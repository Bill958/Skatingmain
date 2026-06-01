import { useEffect, useState } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";

export type MediaItem = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  sort_order: number;
};

export function MediaManager({
  entityType,
  entityId,
}: {
  entityType: "product" | "service";
  entityId: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    supabase
      .from("listing_media")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as MediaItem[]));

  useEffect(() => {
    if (entityId) load();
  }, [entityId]);

  async function onUpload(files: FileList) {
    setBusy(true);
    let next = items.length;
    for (const file of Array.from(files)) {
      try {
        const url = await uploadMedia(file, `${entityType}s`);
        const media_type = file.type.startsWith("video") ? "video" : "image";
        const { error } = await supabase.from("listing_media").insert({
          entity_type: entityType,
          entity_id: entityId,
          media_url: url,
          media_type,
          sort_order: next++,
        });
        if (error) throw error;
      } catch (e: any) {
        toast.error(`${file.name}: ${e.message}`);
      }
    }
    setBusy(false);
    toast.success("Uploaded");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this media?")) return;
    const { error } = await supabase.from("listing_media").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[idx];
    const b = items[j];
    await Promise.all([
      supabase.from("listing_media").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("listing_media").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Gallery (photos & videos)
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md glass px-3 py-1.5 text-xs hover:text-accent">
          <Upload className="h-3.5 w-3.5" />
          {busy ? "Uploading…" : "Add media"}
          <input
            type="file"
            hidden
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
        </label>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No media yet.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((m, i) => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-card border border-border">
              {m.media_type === "image" ? (
                <img src={m.media_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <video src={m.media_url} className="h-full w-full object-cover" muted />
                  <div className="absolute inset-0 grid place-items-center bg-black/30 pointer-events-none">
                    <Play className="h-6 w-6 text-white drop-shadow" />
                  </div>
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1">
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} className="p-1 text-white hover:text-accent" aria-label="Move up">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="p-1 text-white hover:text-accent" aria-label="Move down">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <button type="button" onClick={() => remove(m.id)} className="p-1 text-white hover:text-highlight" aria-label="Delete">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
