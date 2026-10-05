"use client";
import Link from "next/link";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";
import { getLevel } from "@/lib/gamification";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/mascot";

export default function ProfilePage() {
  const { xp, completedLessons, cards } = useLearning();
  const prefs = usePreferences();
  const { level } = getLevel(xp);
  return (
    <main id="main-content" className="interior-page wrap profile-page">
      <header className="interior-hero">
        <div className="interior-copy">
          <span className="eyebrow">YOUR PROFILE</span>
          <h1>Your journey, your way</h1>
          <p>Every little practice session is something to be proud of.</p>
        </div>
        <Mascot mood="happy" />
      </header>
      <section className="profile-grid">
        <Card>
          <span className="eyebrow">LEARNER CARD</span>
          <h2>{prefs.publicNickname || "Nest explorer"}</h2>
          <div className="profile-level">
            Level {level} · {xp} XP
          </div>
          <p>
            {completedLessons.length} lessons finished · {cards.length} cards in your review nook
          </p>
          <Link href="/settings">Personalize your nest →</Link>
        </Card>
        <Card>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h2>Milestones & stickers</h2>
          <p>Collect little reminders of how far you’ve come.</p>
          <Link href="/achievements">Visit achievements →</Link>
        </Card>
        <Card>
          <span className="eyebrow">LEARN TOGETHER, IF YOU LIKE</span>
          <h2>Friendly leaderboard</h2>
          <p>
            {prefs.leaderboardOptIn
              ? `You appear as ${prefs.publicNickname || "Nest explorer"}.`
              : "Your progress stays private until you opt in."}
          </p>
          <Link href="/leaderboard">See the community board →</Link>
        </Card>
      </section>
    </main>
  );
}
