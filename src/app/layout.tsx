import type { Metadata, Viewport } from "next";
import { Nunito, Noto_Sans_JP } from "next/font/google";
import { SiteHeader } from "@/components/site-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorker } from "@/components/service-worker";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { LearningHydrator } from "@/components/learning-hydrator";
import { siteConfig } from "@/config/site";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const japanese = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-japanese", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — A little Japanese, a lot of joy`,
    template: `%s · ${siteConfig.name}`,
  },
  description: "A friendly little place to grow your Japanese, one happy moment at a time.",
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f8f4eb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${japanese.variable}`}>
        <AuthSessionProvider>
          <ThemeProvider>
            <LearningHydrator />
            <SiteHeader />
            {children}
            <ServiceWorker />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
