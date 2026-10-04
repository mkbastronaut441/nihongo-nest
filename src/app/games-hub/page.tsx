import Link from "next/link";
import { Card } from "@/components/ui";
import { ArrowUpRight, Brain, Headphones, Sparkles } from "lucide-react";

const games = [
  {
    href: "/games-hub/memory",
    icon: Brain,
    title: "Kana memory match",
    text: "Pair a kana with its romaji. A cozy brain warm-up.",
    color: "peach",
    tag: "MATCH",
  },
  {
    href: "/games-hub/sound-match",
    icon: Headphones,
    title: "Sound catcher",
    text: "Listen to the Japanese sound and spot its character.",
    color: "mint",
    tag: "LISTEN",
  },
  {
    href: "/games-hub/falling-kana",
    icon: Sparkles,
    title: "Falling kana",
    text: "A quick arcade dash for your ears and reflexes.",
    color: "lavender",
    tag: "ARCADE",
  },
];
export default function GamesHubPage() {
  return (
    <main id="main-content" className="wrap learning-page">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">THE GAME GARDEN</span>
          <h1>Play your way to kana</h1>
          <p>Pick a tiny challenge. Every round is practice in disguise.</p>
        </div>
        <span className="learning-count">🎮 3 games</span>
      </div>
      <div className="games-grid">
        {games.map(({ href, icon: Icon, title, text, color, tag }) => (
          <Link href={href} key={href}>
            <Card className={`game-link-card game-${color}`}>
              <span className="game-tag">{tag}</span>
              <div className="game-icon">
                <Icon size={27} />
              </div>
              <h2>{title}</h2>
              <p>{text}</p>
              <span className="game-link-action">
                Let’s play <ArrowUpRight size={17} />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
