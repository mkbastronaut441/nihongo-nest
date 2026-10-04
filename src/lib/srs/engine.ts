/** Small, deterministic SM-2 inspired scheduler. This module has no browser or app dependencies. */
export type Grade = "again" | "hard" | "good" | "easy";

export type SrsCard = {
  id: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  repetitions: number;
  lastReviewedAt?: string;
};

const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;

export function createSrsCard(id: string, now = new Date()): SrsCard {
  return { id, dueAt: now.toISOString(), intervalDays: 0, ease: 2.5, repetitions: 0 };
}

export function scheduleReview<T extends SrsCard>(card: T, grade: Grade, now = new Date()): T {
  const ease = Math.max(
    MIN_EASE,
    card.ease + (grade === "easy" ? 0.15 : grade === "again" ? -0.2 : grade === "hard" ? -0.15 : 0),
  );
  let repetitions = card.repetitions;
  let intervalDays: number;
  if (grade === "again") {
    repetitions = 0;
    intervalDays = 10 / (24 * 60); // Retry in ten minutes.
  } else if (grade === "hard") {
    intervalDays = repetitions === 0 ? 1 : Math.max(1, card.intervalDays * 1.2);
    repetitions += 1;
  } else if (grade === "easy") {
    intervalDays = repetitions === 0 ? 4 : Math.max(4, card.intervalDays * ease * 1.3);
    repetitions += 1;
  } else {
    intervalDays =
      repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.max(1, card.intervalDays * ease);
    repetitions += 1;
  }
  return {
    ...card,
    repetitions,
    ease,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/** Cards due now or earlier, ordered by due time for a predictable review queue. */
export function getDueCards<T extends SrsCard>(cards: readonly T[], now = new Date()): T[] {
  const cutoff = now.getTime();
  return cards
    .filter((card) => Number.isFinite(Date.parse(card.dueAt)) && Date.parse(card.dueAt) <= cutoff)
    .slice()
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

/** One due-today boundary in the learner's local timezone. */
export function getDueTodayCards<T extends SrsCard>(cards: readonly T[], now = new Date()): T[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + DAY_MS;
  return cards
    .filter((card) => {
      const at = Date.parse(card.dueAt);
      return Number.isFinite(at) && at < end;
    })
    .slice()
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}
