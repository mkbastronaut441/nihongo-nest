export const siteConfig = {
  name: "Nihongo Nest",
  tagline: "A little Japanese, a lot of joy.",
  mascot: { name: "Mochi", emoji: "🐣" },
  colors: {
    sakura: "#e998ad",
    indigo: "#35376f",
    washi: "#fbf8f0",
    matcha: "#769477",
    gold: "#e8b951",
  },
  nav: [
    { label: "Home", href: "/", icon: "home" },
    { label: "Learn", href: "/learning-map", icon: "map" },
    { label: "Practice", href: "/review", icon: "sparkles" },
    { label: "Games", href: "/games-hub", icon: "gamepad" },
    { label: "Profile", href: "/profile", icon: "user" },
  ],
} as const;
