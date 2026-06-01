import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/skatelogo.png";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="inline-flex h-10 w-10 items-center justify-center p-1.5">
            <img src={logo} alt="Sk8 Pro Center" className="h-full w-full object-contain dark:brightness-0 dark:invert" />
          </span>
          <span className="hidden sm:inline text-base">
            Sk8 <span className="text-gradient-accent">Pro</span> Center
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={isAdmin ? "/admin" : "/login"}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card/50 p-2 text-muted-foreground hover:text-accent transition-colors"
            aria-label={isAdmin ? "Admin dashboard" : "Login"}
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-accent hover:bg-card"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border/40">
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-glow"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Gear
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
