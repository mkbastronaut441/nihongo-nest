import { describe, expect, it } from "vitest";
import {
  createSrsCard,
  getDueCards,
  getDueTodayCards,
  scheduleReview,
  type SrsCard,
} from "./engine";

const now = new Date("2026-02-01T12:00:00.000Z");
const graduated = (intervalDays: number, repetitions: number, ease = 2.5): SrsCard => ({
  id: "あ",
  dueAt: now.toISOString(),
  intervalDays,
  repetitions,
  ease,
});

describe("SM-2 inspired scheduler", () => {
  it("starts a new card due immediately", () => {
    expect(createSrsCard("あ", now)).toEqual({
      id: "あ",
      dueAt: now.toISOString(),
      intervalDays: 0,
      ease: 2.5,
      repetitions: 0,
    });
  });
  it("Again resets learning and schedules a short retry", () => {
    const next = scheduleReview(graduated(8, 4), "again", now);
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBeCloseTo(10 / 1440);
    expect(Date.parse(next.dueAt) - now.getTime()).toBeCloseTo(10 * 60_000);
    expect(next.ease).toBe(2.3);
  });
  it("Hard eases a new card and sets a one-day interval", () => {
    const next = scheduleReview(graduated(0, 0), "hard", now);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.ease).toBe(2.35);
  });
  it("Good follows the 1, 6, then ease-based intervals", () => {
    expect(scheduleReview(graduated(0, 0), "good", now).intervalDays).toBe(1);
    expect(scheduleReview(graduated(1, 1), "good", now).intervalDays).toBe(6);
    expect(scheduleReview(graduated(6, 2), "good", now).intervalDays).toBe(15);
  });
  it("Easy gets a longer first interval and raises ease", () => {
    const next = scheduleReview(graduated(0, 0), "easy", now);
    expect(next.intervalDays).toBe(4);
    expect(next.ease).toBe(2.65);
  });
  it("does not let ease fall below 1.3", () => {
    expect(scheduleReview(graduated(2, 1, 1.3), "again", now).ease).toBe(1.3);
  });
  it("records review time and returns a new card", () => {
    const card = graduated(0, 0);
    const next = scheduleReview(card, "good", now);
    expect(next.lastReviewedAt).toBe(now.toISOString());
    expect(card.lastReviewedAt).toBeUndefined();
  });
});

describe("review queue boundaries", () => {
  it("includes due-now and overdue cards only", () => {
    const cards = [
      { ...graduated(0, 0), dueAt: "2026-02-01T11:00:00.000Z" },
      { ...graduated(0, 0), id: "い", dueAt: now.toISOString() },
      { ...graduated(0, 0), id: "う", dueAt: "2026-02-01T12:00:01.000Z" },
    ];
    expect(getDueCards(cards, now).map((card) => card.id)).toEqual(["あ", "い"]);
  });
  it("treats due today as the local calendar day and ignores invalid dates", () => {
    const today = new Date(2026, 1, 1, 12);
    const cards = [
      { ...graduated(0, 0), dueAt: new Date(2026, 1, 1, 23, 59).toISOString() },
      { ...graduated(0, 0), id: "い", dueAt: new Date(2026, 1, 2).toISOString() },
      { ...graduated(0, 0), id: "う", dueAt: "bad-date" },
    ];
    expect(getDueTodayCards(cards, today)).toHaveLength(1);
  });
  it("keeps source queue unchanged", () => {
    const cards = [graduated(0, 0)];
    getDueCards(cards, now);
    expect(cards).toHaveLength(1);
  });
});
