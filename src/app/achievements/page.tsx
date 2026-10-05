"use client";
import { useLearning } from "@/store/learning";
import { Card } from "@/components/ui";

const rewards = [
  {
    id: "first-steps",
    name: "First Steps",
    emoji: "🐾",
    description: "Complete your first lesson",
    earned: (s: { completedLessons: string[] }) => s.completedLessons.length >= 1,
  },
  {
    id: "word-garden",
    name: "Word Gardener",
    emoji: "🌱",
    description: "Grow your review collection to 10 cards",
    earned: (s: { cards: unknown[] }) => s.cards.length >= 10,
  },
  {
    id: "curious-learner",
    name: "Curious Learner",
    emoji: "🔎",
    description: "Complete five lessons",
    earned: (s: { completedLessons: string[] }) => s.completedLessons.length >= 5,
  },
  {
    id: "daily-star",
    name: "Daily Star",
    emoji: "⭐",
    description: "Complete all three daily quests",
    earned: (s: { completedQuests: string[] }) => s.completedQuests.length >= 3,
  },
  {
    id: "traveler",
    name: "Little Traveler",
    emoji: "🗾",
    description: "Finish ten lessons and visit each region",
    earned: (s: { completedLessons: string[] }) => s.completedLessons.length >= 10,
  },
];

export default function AchievementsPage() {
  const state = useLearning();
  return (
    <main id="main-content" className="interior-page wrap achievements-page">
      <span className="eyebrow">BADGES & STICKERS</span>
      <h1>Your bright little milestones</h1>
      <p>These stickers celebrate the time you’ve spent learning.</p>
      <section className="achievement-grid">
        {rewards.map((reward) => {
          const earned = reward.earned(state);
          return (
            <Card
              className={earned ? "achievement-card is-earned" : "achievement-card"}
              key={reward.id}
            >
              <span className="achievement-emoji" aria-hidden="true">
                {reward.emoji}
              </span>
              <h2>{reward.name}</h2>
              <p>{reward.description}</p>
              <strong>{earned ? "Collected ✨" : "A new adventure awaits"}</strong>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
