import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const { data, error } = await supabase.from("blogs").select("*")
        .eq("slug", params.slug).eq("published", true).maybeSingle();
      if (error || !data) throw notFound();
      return { post: data };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.post.title} — Sk8 Pro Center` },
      { name: "description", content: loaderData.post.excerpt ?? loaderData.post.title },
      { property: "og:title", content: loaderData.post.title },
      { property: "og:description", content: loaderData.post.excerpt ?? "" },
      ...(loaderData.post.cover_url ? [{ property: "og:image", content: loaderData.post.cover_url }] : []),
    ] : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-accent">← Back to blog</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout><div className="mx-auto max-w-3xl px-4 py-24"><p>We couldn't load this post right now. Please try again shortly.</p></div></SiteLayout>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData() as { post: any };
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 md:px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-6">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        {post.excerpt && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-3">{post.excerpt}</p>}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
            {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span>·</span><span>{post.author}</span>
        </div>
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} className="mt-8 w-full aspect-video object-cover rounded-2xl" />
        )}
        {post.video_url && (
          <video src={post.video_url} controls className="mt-6 w-full aspect-video rounded-2xl bg-black" />
        )}
        <div className="mt-8 prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-accent prose-strong:text-foreground prose-li:text-foreground/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </SiteLayout>
  );
}
