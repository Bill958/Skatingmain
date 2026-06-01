import { useEffect, useState } from "react";
import { Upload, Trash2, Play, Pencil, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";
import { ConfirmDialog, useConfirm } from "@/components/confirm-dialog";

type Item = { id: string; title: string | null; media_url: string; media_type: "image" | "video" };

export function GalleryAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { confirmState, confirm, close } = useConfirm();

  const load = () => supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setItems((data ?? []) as Item[]));
  useEffect(() => { load(); }, []);

  async function upload(files: FileList) {
    setBusy(true);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadMedia(file, "gallery");
        const media_type = file.type.startsWith("video") ? "video" : "image";
        const { error } = await supabase.from("gallery_items").insert({ media_url: url, media_type, title: file.name });
        if (error) throw error;
      } catch (e: any) {
        toast.error(`${file.name}: ${e.message}`);
      }
    }
    setBusy(false); toast.success("Uploaded"); load();
  }

  function handleDelete(item: Item) {
    confirm(
      `Delete "${item.title ?? "this item"}"?`,
      "This media item will be permanently removed from the gallery.",
      async () => {
        const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
        if (error) return toast.error(error.message);
        toast.success("Deleted");
        load();
        close();
      }
    );
  }

  function startRename(item: Item) {
    setRenamingId(item.id);
    setRenameValue(item.title ?? "");
  }

  async function saveRename(id: string) {
    const { error } = await supabase.from("gallery_items").update({ title: renameValue }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setRenamingId(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h2 className="text-xl font-bold">Gallery <span className="text-muted-foreground text-sm font-normal">({items.length})</span></h2>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow">
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload photos / videos"}
          <input type="file" hidden multiple accept="image/*,video/*" onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No media yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Upload photos or videos using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((it) => (
            <div key={it.id} className="group relative aspect-square rounded-xl glass overflow-hidden">
              {it.media_type === "image" ? (
                <img src={it.media_url} alt={it.title ?? ""} className="h-full w-full object-cover" />
              ) : (
                <>
                  <video src={it.media_url} className="h-full w-full object-cover" muted />
                  <div className="absolute inset-0 grid place-items-center bg-black/30 pointer-events-none">
                    <Play className="h-8 w-8 text-white drop-shadow" />
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => startRename(it)} className="rounded-full bg-accent p-1.5" aria-label="Rename">
                  <Pencil className="h-3.5 w-3.5 text-accent-foreground" />
                </button>
                <button onClick={() => handleDelete(it)} className="rounded-full bg-highlight p-1.5" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Inline rename */}
              {renamingId === it.id ? (
                <div className="absolute inset-x-0 bottom-0 bg-background/95 p-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveRename(it.id); if (e.key === "Escape") setRenamingId(null); }}
                    className="flex-1 min-w-0 rounded bg-card border border-border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-accent"
                    autoFocus
                    aria-label="Edit caption"
                  />
                  <button onClick={() => saveRename(it.id)} className="rounded bg-accent px-2 py-1 text-[10px] font-semibold text-accent-foreground">Save</button>
                  <button onClick={() => setRenamingId(null)} className="rounded glass px-2 py-1 text-[10px]">×</button>
                </div>
              ) : it.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white truncate">
                  {it.title}
                </div>
              )}
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
