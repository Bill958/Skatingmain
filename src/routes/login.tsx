import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin Login — Sk8 Pro Center" }] }),
  component: LoginPage,
});

type Mode = "signin" | "reset";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, loading, navigate]);

  async function submitSignIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Enter your email address first");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setResetSent(true);
  }

  const inputCls = "mt-1 w-full rounded-md bg-background/60 border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="min-h-screen grid place-items-center bg-hero-gradient px-4">
      <div className="w-full max-w-md rounded-2xl glass p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
            <Lock className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">
            {mode === "signin" ? "Admin Sign In" : "Reset Password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Manage Sk8 Pro Center content" : "We'll send a reset link to your email"}
          </p>
        </div>

        {mode === "signin" ? (
          <form onSubmit={submitSignIn} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                id="login-email"
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                id="login-password"
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              Forgot your password?
            </button>
            <button
              type="submit" disabled={busy}
              className="w-full rounded-md bg-accent-gradient px-4 py-2.5 font-semibold text-accent-foreground shadow-glow disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : resetSent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/20">
              <Mail className="h-6 w-6 text-brand" />
            </div>
            <p className="text-sm text-muted-foreground">
              Check your inbox — we've sent a reset link to <strong className="text-foreground">{email}</strong>.
            </p>
            <button onClick={() => { setMode("signin"); setResetSent(false); }} className="text-sm text-accent hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={submitReset} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                id="reset-email"
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </div>
            <button
              type="submit" disabled={busy}
              className="w-full rounded-md bg-accent-gradient px-4 py-2.5 font-semibold text-accent-foreground shadow-glow disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send Reset Link"}
            </button>
            <button type="button" onClick={() => setMode("signin")} className="w-full text-sm text-muted-foreground hover:text-accent transition-colors">
              Back to sign in
            </button>
          </form>
        )}

        {user && !isAdmin && !loading && (
          <p className="mt-4 text-center text-xs text-highlight">
            Signed in but not an admin.{" "}
            <a href="mailto:admin@sk8pro.co.ke" className="underline">Contact the site owner</a>.
          </p>
        )}
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-accent">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
