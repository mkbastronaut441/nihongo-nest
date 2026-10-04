"use client";

import { useEffect } from "react";
import { usePreferences } from "@/store/preferences";
import { siteConfig } from "@/config/site";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { ageMode, fontScale, highContrast, reducedMotion, dyslexiaFont, setHydrated } =
    usePreferences();

  useEffect(() => {
    void usePreferences.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
    return () => {
      document.documentElement.style.removeProperty("--font-scale");
    };
  }, [fontScale]);

  return (
    <div
      className="app-theme"
      data-age={ageMode}
      data-contrast={highContrast ? "high" : "normal"}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-font={dyslexiaFont ? "dyslexia" : "default"}
      style={
        {
          "--font-scale": fontScale,
          "--brand-sakura": siteConfig.colors.sakura,
          "--brand-indigo": siteConfig.colors.indigo,
          "--brand-washi": siteConfig.colors.washi,
          "--brand-matcha": siteConfig.colors.matcha,
          "--brand-gold": siteConfig.colors.gold,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
