"use client";

import Link from "next/link";
import { Card, ProgressBar, Button } from "@/components/ui";
import { Mascot } from "@/components/mascot";
import { getLevel, DAILY_QUESTS, localDateKey, localWeekKey } from "@/lib/gamification";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";

export default function DashboardPage() {
  const {
    xp,
    cards,
    completedLessons,
    weeklyQuest,
    questDate,
    questCounts,
    completedQuests,
    streak,
  } = useLearning();
  const { level, progress } = getLevel(xp);
  const ageMode = usePreferences((state) => state.ageMode);
  const due = cards.filter((card) => Date.parse(card.dueAt) <= Date.now()).length;
  const questProgress =
    questDate === localDateKey()
      ? [questCounts.minutes, questCounts.review, questCounts.lesson]
      : [0, 0, 0];
  const todaysCompleted = questDate === localDateKey() ? completedQuests : [];
  const weekly =
    weeklyQuest.weekKey === localWeekKey() ? weeklyQuest : { count: 0, completed: false };
  return (
    <main id="main-content" className="interior-page wrap gamified-dashboard">
      <header className="interior-hero">
        <div className="interior-copy">
          <span className="eyebrow">YOUR LEARNING SPACE · {ageMode.toUpperCase()} MODE</span>
          <h1>Your nest, your pace</h1>
          <p>A little time with Japanese is always time well spent.</p>
        </div>
        <Mascot mood="celebrate" />
      </header>
      <section className="phase4-stats">
        <Card>
          <span>✦ XP</span>
          <strong>{xp}</strong>
          <small>Level {level}</small>
          <ProgressBar value={progress} label={`Level ${level} progress`} />
        </Card>
        <Card>
          <span>🔥 Streak</span>
          <strong>{streak.currentDays} days</strong>
          <small>
            {streak.freezesAvailable} streak freeze{streak.freezesAvailable === 1 ? "" : "s"} ready
            · best {streak.longestDays} days
          </small>
        </Card>
        <Card>
          <span>🗂 Due reviews</span>
          <strong>{due}</strong>
          <Link href="/review">Visit your review nook →</Link>
        </Card>
      </section>
      <section className="phase4-columns">
        <Card>
          <span className="eyebrow">TODAY’S LITTLE QUESTS</span>
          <h2>Small steps, bright stars</h2>
          <div className="quest-list">
            {DAILY_QUESTS.map((quest, index) => {
              const value = Math.min(quest.target, questProgress[index]);
              return (
                <div className="quest-row" key={quest.slug}>
                  <div>
                    <strong>{quest.title}</strong>
                    <small>{quest.description}</small>
                  </div>
                  <span>
                    {todaysCompleted.includes(quest.slug)
                      ? "Complete ✨"
                      : `${value}/${quest.target} · +${quest.rewardXp} XP`}
                  </span>
                </div>
              );
            })}
          </div>
          <Link className="button button--primary" href="/quick-lesson">
            Start a 5-minute lesson
          </Link>
          <p className="weekly-note">
            {weekly.completed
              ? "Weekly challenge complete · +60 XP collected! ✨"
              : `Weekly challenge · finish three lessons this week: ${weekly.count}/3 · +60 XP`}
            . Every bit of progress counts.
          </p>
        </Card>
        <Card>
          <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
          <h2>
            {completedLessons.length ? "Ready for another step?" : "Your first adventure is ready"}
          </h2>
          <p>Continue your journey through the grammar garden.</p>
          <Link href="/lesson-player?lesson=g01-desu">
            <Button>Continue learning →</Button>
          </Link>
          <p className="dashboard-map-link">
            <Link href="/learning-map">See your Japan journey map →</Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
