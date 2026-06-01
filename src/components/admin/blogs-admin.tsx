import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, X, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";
import { ConfirmDialog, useConfirm } from "@/components/confirm-dialog";

type Blog = {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; cover_url: string | null; video_url: string | null;
  author: string; published: boolean; created_at: string;
};

const empty = { title: "", slug: "", excerpt: "", content: "", cover_url: "", video_url: "", author: "Sk8 Pro Center", published: true };

export function BlogsAdmin() {
  const [items, setItems] = useState<Blog[]>([]);
  const [editing, setEditing] = useState<(typeof empty & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { confirmState, confirm, close } = useConfirm();

  const load = () => supabase.from("blogs").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setItems((data ?? []) as Blog[]));
  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  async function save() {
    if (!editing) return;
    if (!editing.title || !editing.content) return toast.error("Title and content required");
    const payload = { ...editing, slug: editing.slug || slugify(editing.title) };
    setBusy(true);
    const { id, ...rest } = payload;
    const { error } = id
      ? await supabase.from("blogs").update(rest).eq("id", id)
      : await supabase.from("blogs").insert(rest);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(id ? "Updated" : "Created");
    setEditing(null); load();
  }

  function handleDelete(b: Blog) {
    confirm(
      `Delete "${b.title}"?`,
      "This blog post will be permanently removed from the site.",
      async () => {
        const { error } = await supabase.from("blogs").delete().eq("id", b.id);
        if (error) return toast.error(error.message);
        toast.success("Deleted");
        load();
        close();
      }
    );
  }

  async function uploadFile(file: File, field: "cover_url" | "video_url") {
    if (!editing) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, "blogs");
      setEditing({ ...editing, [field]: url });
      toast.success("Uploaded");
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  }

  // Simple markdown → plain HTML preview (headings, bold, italic, paragraphs)
  function renderMarkdown(md: string) {
    return md
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<[hH])/gm, "")
      .replace(/^(.+?)(?=<|$)/gm, (_, p) => p.trim() ? `<p>${p}</p>` : "");
  }

  const cls = "w-full rounded-md bg-background/60 border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h2 className="text-xl font-bold">Blog posts <span className="text-muted-foreground text-sm font-normal">({items.length})</span></h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No posts yet.</p>
          <button onClick={() => setEditing({ ...empty })} className="mt-3 text-sm text-accent hover:underline">Write your first post →</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-xl glass p-3">
              {b.cover_url ? (
                <img src={b.cover_url} alt="" className="h-16 w-24 rounded-md object-cover flex-shrink-0" />
              ) : <div className="h-16 w-24 rounded-md bg-muted flex-shrink-0 grid place-items-center"><FileText className="h-6 w-6 text-muted-foreground/40" /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{b.title}</h3>
                  <span className={`text-[10px] uppercase rounded px-1.5 py-0.5 font-medium ${b.published ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"}`}>
                    {b.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">/{b.slug} · {b.author}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing({ id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt ?? "", content: b.content, cover_url: b.cover_url ?? "", video_url: b.video_url ?? "", author: b.author, published: b.published });
                    setPreviewMode(false);
                  }}
                  className="p-2 rounded-md hover:bg-card text-muted-foreground hover:text-accent"
                  aria-label={`Edit ${b.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-2 rounded-md hover:bg-card text-muted-foreground hover:text-highlight"
                  aria-label={`Delete ${b.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          onClick={() => setEditing(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-modal-title"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="blog-modal-title" className="font-bold text-lg">{editing.id ? "Edit post" : "New post"}</h3>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3">
              <div>
                <label htmlFor="blog-title" className="text-xs uppercase tracking-wider text-muted-foreground">Title</label>
                <input
                  id="blog-title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                  className={`mt-1 ${cls}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="blog-slug" className="text-xs uppercase tracking-wider text-muted-foreground">Slug (URL)</label>
                  <input
                    id="blog-slug"
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    placeholder="auto-from-title"
                    className={`mt-1 ${cls}`}
                  />
                </div>
                <div>
                  <label htmlFor="blog-author" className="text-xs uppercase tracking-wider text-muted-foreground">Author</label>
                  <input
                    id="blog-author"
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                    className={`mt-1 ${cls}`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="blog-excerpt" className="text-xs uppercase tracking-wider text-muted-foreground">Excerpt</label>
                <textarea
                  id="blog-excerpt"
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className={`mt-1 ${cls}`}
                />
              </div>

              {/* Cover image */}
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Cover image</span>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  {editing.cover_url && <img src={editing.cover_url} alt="" className="h-16 w-24 rounded object-cover" />}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md glass px-3 py-2 text-sm hover:text-accent transition-colors">
                    <Upload className="h-4 w-4" />
                    {busy ? "Uploading…" : editing.cover_url ? "Replace" : "Upload"}
                    <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "cover_url")} />
                  </label>
                  {editing.cover_url && (
                    <button onClick={() => setEditing({ ...editing, cover_url: "" })} className="text-xs text-muted-foreground hover:text-highlight">Remove</button>
                  )}
                </div>
              </div>

              {/* Content with preview toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="blog-content" className="text-xs uppercase tracking-wider text-muted-foreground">Content (Markdown)</label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                </div>
                {previewMode ? (
                  <div
                    className="w-full min-h-[200px] rounded-md border border-border bg-background/30 px-4 py-3 text-sm prose prose-invert max-w-none overflow-auto"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(editing.content) }}
                  />
                ) : (
                  <textarea
                    id="blog-content"
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    rows={12}
                    className={`${cls} font-mono text-sm`}
                    placeholder="Write in Markdown. ## Heading, **bold**, *italic*, etc."
                  />
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="accent-[oklch(0.72_0.19_40)]"
                />
                Published (visible on the site)
              </label>

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setEditing(null)} className="rounded-md glass px-4 py-2 text-sm">Cancel</button>
                <button
                  onClick={save} disabled={busy}
                  className="rounded-md bg-accent-gradient px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
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
