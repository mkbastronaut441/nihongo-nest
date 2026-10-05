/** Shared, deterministic rules for XP, streaks and daily quest progress. */
export const XP_PER_LEVEL = 100;

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export type WeeklyQuestState = { weekKey: string; count: number; completed: boolean };

export function localWeekKey(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDateKey(monday);
}

export function advanceWeeklyQuest(current: WeeklyQuestState, now = new Date()) {
  const weekKey = localWeekKey(now);
  const base = current.weekKey === weekKey ? current : { weekKey, count: 0, completed: false };
  if (base.completed) return { ...base, reward: 0 };
  const count = Math.min(3, base.count + 1);
  const completed = count >= 3;
  return { weekKey, count, completed, reward: completed ? 60 : 0 };
}

export function getLevel(xp: number) {
  const safeXp = Math.max(0, Math.floor(xp));
  return { level: Math.floor(safeXp / XP_PER_LEVEL) + 1, progress: safeXp % XP_PER_LEVEL };
}

export type StreakState = {
  currentDays: number;
  longestDays: number;
  lastActivityAt: string | null;
  freezesAvailable: number;
  lastFreezeAt?: string | null;
};

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const dayGap = (a: Date, b: Date) => {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
};

export function recordActivity(streak: StreakState, now = new Date()): StreakState {
  if (!streak.lastActivityAt) {
    return {
      ...streak,
      currentDays: 1,
      longestDays: Math.max(1, streak.longestDays),
      lastActivityAt: now.toISOString(),
    };
  }
  const last = new Date(streak.lastActivityAt);
  const gap = dayGap(last, now);
  if (gap <= 0) return streak;
  if (gap === 1) {
    const currentDays = streak.currentDays + 1;
    return {
      ...streak,
      currentDays,
      longestDays: Math.max(streak.longestDays, currentDays),
      lastActivityAt: now.toISOString(),
    };
  }
  if (
    gap === 2 &&
    streak.freezesAvailable > 0 &&
    dayKey(now) !== dayKey(new Date(streak.lastFreezeAt ?? ""))
  ) {
    return {
      ...streak,
      currentDays: streak.currentDays + 1,
      longestDays: Math.max(streak.longestDays, streak.currentDays + 1),
      freezesAvailable: streak.freezesAvailable - 1,
      lastFreezeAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
    };
  }
  return {
    ...streak,
    currentDays: 1,
    longestDays: Math.max(1, streak.longestDays),
    lastActivityAt: now.toISOString(),
  };
}

export type QuestProgress = {
  progress: number;
  target: number;
  completed: boolean;
  rewardXp: number;
};
export function advanceQuest(quest: QuestProgress, amount = 1): QuestProgress {
  if (quest.completed) return quest;
  const progress = Math.min(quest.target, quest.progress + Math.max(0, Math.floor(amount)));
  return { ...quest, progress, completed: progress >= quest.target };
}

export const DAILY_QUESTS = [
  {
    slug: "daily-five",
    title: "Five-minute nest visit",
    description: "Spend five minutes learning",
    target: 5,
    rewardXp: 25,
  },
  {
    slug: "daily-review",
    title: "Little review, big growth",
    description: "Review five cards",
    target: 5,
    rewardXp: 20,
  },
  {
    slug: "daily-lesson",
    title: "One step on the path",
    description: "Finish one lesson",
    target: 1,
    rewardXp: 30,
  },
] as const;
