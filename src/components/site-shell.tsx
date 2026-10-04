"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Gamepad2, Home, Menu, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const iconMap = {
  home: Home,
  map: Compass,
  sparkles: Sparkles,
  gamepad: Gamepad2,
  user: UserRound,
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label={`${siteConfig.name} home`}>
            <span className="brand-mark" aria-hidden="true">
              巣
            </span>
            <span>
              {siteConfig.name}
              <small>ことばの巣へようこそ</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {siteConfig.nav.map((item) => {
              const Icon = iconMap[item.icon];
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-link is-active" : "nav-link"}
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link className="header-cta" href="/onboarding">
            <Sparkles size={16} /> Start learning
          </Link>
          <button
            className="mobile-menu-button"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {siteConfig.nav.map((item) => (
              <Link onClick={() => setOpen(false)} key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link onClick={() => setOpen(false)} href="/settings">
              Settings
            </Link>
            <Link onClick={() => setOpen(false)} href="/reading-library">
              <BookOpen size={16} /> Reading library
            </Link>
          </nav>
        )}
      </header>
      <nav className="bottom-nav" aria-label="Quick navigation">
        {siteConfig.nav.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={
                (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                  ? "bottom-link is-active"
                  : "bottom-link"
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
