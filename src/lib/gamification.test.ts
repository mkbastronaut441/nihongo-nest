import { describe, expect, it } from "vitest";
import { advanceQuest, advanceWeeklyQuest, getLevel, recordActivity } from "./gamification";

describe("XP levels", () => {
  it("starts at level one and rolls over every hundred XP", () => {
    expect(getLevel(0)).toEqual({ level: 1, progress: 0 });
    expect(getLevel(99)).toEqual({ level: 1, progress: 99 });
    expect(getLevel(100)).toEqual({ level: 2, progress: 0 });
    expect(getLevel(-5)).toEqual({ level: 1, progress: 0 });
  });
});

describe("daily streak", () => {
  const stamp = (day: number) => new Date(2026, 2, day, 12).toISOString();
  it("starts, increments once per day, and avoids duplicate-day increments", () => {
    const start = recordActivity(
      { currentDays: 0, longestDays: 0, lastActivityAt: null, freezesAvailable: 1 },
      new Date(stamp(1)),
    );
    expect(start.currentDays).toBe(1);
    expect(recordActivity(start, new Date(stamp(1))).currentDays).toBe(1);
    expect(recordActivity(start, new Date(stamp(2))).currentDays).toBe(2);
  });
  it("uses a freeze for one missed day and resets after a longer gap", () => {
    const state = { currentDays: 3, longestDays: 5, lastActivityAt: stamp(1), freezesAvailable: 1 };
    const frozen = recordActivity(state, new Date(stamp(3)));
    expect(frozen).toMatchObject({ currentDays: 4, freezesAvailable: 0 });
    expect(recordActivity(state, new Date(stamp(5)))).toMatchObject({
      currentDays: 1,
      freezesAvailable: 1,
    });
  });
});

describe("quest progress", () => {
  it("caps progress and marks completion once target is reached", () => {
    const quest = { progress: 2, target: 3, completed: false, rewardXp: 10 };
    expect(advanceQuest(quest)).toMatchObject({ progress: 3, completed: true });
    expect(advanceQuest(advanceQuest(quest, 8))).toMatchObject({ progress: 3, completed: true });
    expect(advanceQuest({ ...quest, completed: true }, 1)).toEqual({ ...quest, completed: true });
  });

  it("rewards three weekly lessons once and resets at the next week", () => {
    const monday = new Date(2026, 2, 2, 12);
    const first = advanceWeeklyQuest({ weekKey: "2026-03-02", count: 0, completed: false }, monday);
    const second = advanceWeeklyQuest(first, new Date(2026, 2, 3, 12));
    const third = advanceWeeklyQuest(second, new Date(2026, 2, 4, 12));
    expect(third).toMatchObject({ count: 3, completed: true, reward: 60 });
    expect(advanceWeeklyQuest(third, new Date(2026, 2, 5, 12)).reward).toBe(0);
    expect(advanceWeeklyQuest(third, new Date(2026, 2, 9, 12))).toMatchObject({
      count: 1,
      completed: false,
    });
  });
});
