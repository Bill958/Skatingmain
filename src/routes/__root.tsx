import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { WelcomeSplash } from "@/components/welcome-splash";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://mainsk8procenter.com";

// Inline script injected before body renders — reads localStorage to apply the correct
// theme class before React hydrates, preventing a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem("sk8-theme");if(t==="light")document.documentElement.classList.add("light");}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Main Sk8 Pro Center — Premium Skateboarding in Nairobi" },
      { name: "description", content: "Nairobi's premier skate hub: inline skates, skateboards, rollerblades, coaching, repairs, and school programs. Shop premium gear and join the community." },
      { name: "keywords", content: "skateboarding Nairobi, inline skates Kenya, rollerblades Nairobi, skate shop Kenya, skateboard coaching, skate lessons Nairobi, Main Sk8 Pro Center" },
      { name: "author", content: "Main Sk8 Pro Center" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Main Sk8 Pro Center" },
      { property: "og:title", content: "Main Sk8 Pro Center — Premium Skateboarding in Nairobi" },
      { property: "og:description", content: "Gear, coaching, and community for skaters in Nairobi." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_KE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Main Sk8 Pro Center — Premium Skateboarding in Nairobi" },
      { name: "twitter:description", content: "Gear, coaching, and community for skaters in Nairobi." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      // Anti-FOUC theme script — must run synchronously before paint
      { children: themeScript },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Main Sk8 Pro Center",
          url: SITE_URL,
          email: "mainskateprocenter@gmail.com",
          description: "Nairobi's premier skateboarding hub: gear, coaching, gallery, and community for inline skaters, skateboarders & rollerbladers.",
          address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
          areaServed: "Nairobi, Kenya",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <WelcomeSplash />
      <Outlet />
      <Toaster theme="dark" position="top-right" richColors />
    </>
  );
}
