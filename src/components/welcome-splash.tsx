import { useEffect, useState } from "react";
import logo from "@/assets/skatelogo.png";

export function WelcomeSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("sk8_splash_seen");
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("sk8_splash_seen", "1");
    }, 1700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-hero-gradient transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl animate-pulse" />
      </div>
      <div className="relative flex flex-col items-center gap-6 splash-rise">
        <img
          src={logo}
          alt="Sk8 Pro Center"
          className="h-28 w-28 object-contain brightness-0 invert splash-spin"
        />
        <h1 className="text-3xl md:text-5xl font-bold text-center px-4">
          Welcome to <span className="text-gradient-accent">MainSk8Pro Center</span>
        </h1>
        <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-card">
          <div className="h-full w-full bg-accent-gradient splash-bar" />
        </div>
      </div>
    </div>
  );
}
