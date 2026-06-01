import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Clock, Phone } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.85a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 mt-20 bg-[oklch(0.13_0.02_270)] text-[oklch(0.98_0_0)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-bold text-lg mb-3">
            Sk8 <span className="text-gradient-accent">Pro</span> Center
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Nairobi's premier skateboarding hub — gear, coaching, and community for every level.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/60">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-accent">Shop</Link></li>
            <li><Link to="/services" className="hover:text-accent">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
            <li><Link to="/testimonials" className="hover:text-accent">Testimonials</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/60">Visit</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" /> Skatepark Aga Khan Walk, Nairobi</li>
            <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" /> <span>Mon–Sat: 8am – 5pm<br/>Sun: 11am – 6pm</span></li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" /><span>+254 707 252 034</span></li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" /><span>mainskateprocenter@gmail.com</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/60">Follow</h4>
          <div className="flex flex-wrap gap-2">
            <a href="#" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href="#" aria-label="TikTok" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors">
              <TikTokIcon className="h-4 w-4" />
            </a>
            <a href="#" aria-label="X (Twitter)" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors">
              <XIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Sk8 Pro Center. All rights reserved.
      </div>
    </footer>
  );
}
