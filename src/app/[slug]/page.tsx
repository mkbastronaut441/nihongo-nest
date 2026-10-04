import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Flower2,
  Gamepad2,
  Heart,
  Languages,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Button, Card, ProgressBar } from "@/components/ui";
import { Mascot } from "@/components/mascot";
import SettingsPanel from "@/components/settings-panel";

const routes = {
  dashboard: {
    title: "Your nest, your pace",
    sub: "A little time with Japanese is always time well spent.",
    icon: Sparkles,
    tag: "YOUR LEARNING SPACE",
  },
  "learning-map": {
    title: "A map full of little discoveries",
    sub: "Every path is yours to explore. There’s no hurry to get anywhere.",
    icon: Compass,
    tag: "YOUR LEARNING MAP",
  },
  "reading-library": {
    title: "A shelf for curious minds",
    sub: "Short reads and big discoveries will be right here.",
    icon: BookOpen,
    tag: "READING NOOK",
  },
  "culture-corner": {
    title: "A little corner of Japan",
    sub: "Customs, celebrations and everyday curiosities, all in one spot.",
    icon: Flower2,
    tag: "CULTURE CORNER",
  },
  profile: {
    title: "Your journey, your way",
    sub: "A home for your learning preferences and growing milestones.",
    icon: Heart,
    tag: "YOUR PROFILE",
  },
  "parent-teacher-dashboard": {
    title: "A welcoming space for grown-ups",
    sub: "Helpful tools for supporting a young learner are being prepared.",
    icon: UsersRound,
    tag: "FAMILY & CLASSROOM",
  },
  settings: {
    title: "Make yourself at home",
    sub: "Your nest should feel just right. Change the look and feel whenever you like.",
    icon: Settings,
    tag: "YOUR PREFERENCES",
  },
  licenses: {
    title: "A note about our learning content",
    sub: "Vocabulary examples, readings, mnemonics, and grammar lessons are project-authored. Ordered kanji stroke paths are from KanjiVG under CC BY-SA 3.0.",
    icon: Heart,
    tag: "CONTENT & CREDITS",
  },
} as const;

const shortcuts: { href: string; label: string; icon: typeof Compass }[] = [
  { href: "learning-map", label: "Learning map", icon: Compass },
  { href: "lesson-player", label: "Grammar lessons", icon: BookOpen },
  { href: "vocabulary", label: "N5 word garden", icon: Languages },
  { href: "kanji", label: "N5 kanji garden", icon: Sparkles },
  { href: "games-hub", label: "Games & play", icon: Gamepad2 },
  { href: "reading-library", label: "Reading nook", icon: BookOpen },
  { href: "review", label: "Quick review", icon: Sparkles },
  { href: "kana-kanji-explorer", label: "Kana & kanji", icon: Compass },
];

export function generateStaticParams() {
  return Object.keys(routes).map((slug) => ({ slug }));
}

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in routes)) notFound();
  const page = routes[slug as keyof typeof routes];
  const Icon = page.icon;
  const isSettings = slug === "settings";
  const isDashboard = slug === "dashboard";
  const isLicenses = slug === "licenses";
  return (
    <main id="main-content" className="interior-page wrap">
      <div className="page-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        {page.tag}
      </div>
      <section className="interior-hero">
        <div className="interior-copy">
          <span className="eyebrow">{page.tag}</span>
          <h1>{page.title}</h1>
          <p>{page.sub}</p>
        </div>
        <div className="interior-mascot">
          <Mascot mood={isDashboard ? "celebrate" : "happy"} />
        </div>
      </section>
      {isSettings ? (
        <SettingsPanel />
      ) : isDashboard ? (
        <section className="dashboard-grid">
          <Card className="dashboard-progress">
            <span className="eyebrow">A fresh start</span>
            <h2>Welcome to your nest</h2>
            <p>
              Your Japanese journey is all your own. Choose a small step and Mochi will be right
              there.
            </p>
            <div className="dashboard-stat">
              <span>Journey progress</span>
              <strong>Just beginning</strong>
            </div>
            <ProgressBar value={8} label="Journey progress" />
            <Link href="/learning-map">
              <Button>
                Visit your learning map <ArrowRight size={17} />
              </Button>
            </Link>
          </Card>
          <Card className="dashboard-shortcuts">
            <span className="eyebrow">Pick a cozy corner</span>
            <h2>Where to today?</h2>
            <div className="shortcut-list">
              {shortcuts.map(({ href, label, icon: ShortcutIcon }) => (
                <Link key={href} href={`/${href}`}>
                  <ShortcutIcon size={18} />
                  {label}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      ) : (
        <Card className="placeholder-card">
          <div className="placeholder-icon">
            <Icon size={25} />
          </div>
          <h2>
            {isLicenses
              ? "Open, original, and clearly credited."
              : "A good thing takes its own time."}
          </h2>
          <p>
            {isLicenses
              ? "We write the learning examples, readings, and memory stories ourselves. The ordered kanji stroke paths are reused under an open license."
              : "We’re setting up this cozy corner. Your learning content and activities will arrive in a later phase."}
          </p>
          {isLicenses && (
            <p className="license-attribution">
              KanjiVG stroke data © Ulrich Apel, licensed under Creative Commons Attribution-Share
              Alike 3.0 Unported.{" "}
              <a href="https://github.com/KanjiVG/kanjivg" target="_blank" rel="noreferrer">
                View the KanjiVG source
              </a>
              . Kana, vocabulary examples, grammar lessons, kanji readings and mnemonics are
              project-authored. No Tatoeba or KANJIDIC material is included.
            </p>
          )}
          <Link href="/dashboard">
            <Button variant="secondary">
              Head back to your nest <ArrowRight size={17} />
            </Button>
          </Link>
        </Card>
      )}
      <footer className="interior-footer">
        <Link href="/settings">
          <Settings size={15} /> Change your settings
        </Link>
        <span>Little steps still count ✿</span>
        <Link href="/licenses">Content credits</Link>
      </footer>
    </main>
  );
}
