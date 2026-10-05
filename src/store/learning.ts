"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSrsCard, scheduleReview, type Grade, type SrsCard } from "@/lib/srs/engine";
import {
  advanceWeeklyQuest,
  DAILY_QUESTS,
  localDateKey,
  localWeekKey,
  recordActivity,
  type StreakState,
} from "@/lib/gamification";

export type StudyCard = SrsCard & {
  contentId: string;
  kind: "kana" | "vocabulary" | "kanji";
  front: string;
  reading: string;
  meaning: string;
  example?: string;
  exampleMeaning?: string;
};
export type KanaCard = StudyCard & {
  kanaId: string;
  character: string;
  romaji: string;
  script: string;
};
export type VocabularyCard = StudyCard & { vocabularyId: string };
type LearningState = {
  learned: string[];
  cards: StudyCard[];
  xp: number;
  completedLessons: string[];
  lessonCompletions: { id: string; date: string }[];
  skippedLessons: string[];
  placementScore: number | null;
  questDate: string;
  questCounts: { review: number; lesson: number; minutes: number };
  completedQuests: string[];
  streak: StreakState;
  weeklyQuest: { weekKey: string; count: number; completed: boolean };
  addKana: (kana: { kanaId: string; character: string; romaji: string; script: string }) => void;
  addVocabulary: (item: {
    id: string;
    word: string;
    reading: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
  }) => void;
  gradeKana: (id: string, grade: Grade, now?: Date) => void;
  completeLesson: (id: string, xp: number) => void;
  setPlacement: (score: number, skipped: string[]) => void;
  recordQuestProgress: (kind: "review" | "lesson" | "minutes", amount?: number) => void;
  mergeAccountSnapshot: (snapshot: {
    xp: number;
    completedLessons: string[];
    lessonCompletions?: { id: string; date: string }[];
    cards: StudyCard[];
    streak?: StreakState | null;
  }) => void;
};

const todayKey = localDateKey;
const advanceDailyQuest = (
  state: LearningState,
  kind: "review" | "lesson" | "minutes",
  amount = 1,
) => {
  const fresh =
    state.questDate === todayKey()
      ? state
      : {
          ...state,
          questDate: todayKey(),
          questCounts: { review: 0, lesson: 0, minutes: 0 },
          completedQuests: [],
        };
  const questCounts = {
    ...fresh.questCounts,
    [kind]: fresh.questCounts[kind] + Math.max(0, amount),
  };
  const completedQuests = [...fresh.completedQuests];
  const streak = recordActivity(fresh.streak, new Date());
  let reward = 0;
  const options = [
    { slug: "daily-five", kind: "minutes" as const, target: 5 },
    { slug: "daily-review", kind: "review" as const, target: 5 },
    { slug: "daily-lesson", kind: "lesson" as const, target: 1 },
  ];
  for (const quest of options) {
    if (questCounts[quest.kind] >= quest.target && !completedQuests.includes(quest.slug)) {
      completedQuests.push(quest.slug);
      reward += DAILY_QUESTS.find((item) => item.slug === quest.slug)?.rewardXp ?? 0;
    }
  }
  return { questDate: fresh.questDate, questCounts, completedQuests, streak, reward };
};

export const useLearning = create<LearningState>()(
  persist(
    (set) => ({
      learned: [],
      cards: [],
      xp: 0,
      completedLessons: [],
      lessonCompletions: [],
      skippedLessons: [],
      placementScore: null,
      questDate: todayKey(),
      questCounts: { review: 0, lesson: 0, minutes: 0 },
      completedQuests: [],
      streak: { currentDays: 0, longestDays: 0, lastActivityAt: null, freezesAvailable: 1 },
      weeklyQuest: { weekKey: localWeekKey(), count: 0, completed: false },
      addKana: (kana) =>
        set((state) => {
          if (state.cards.some((card) => card.id === kana.kanaId)) return state;
          const base = createSrsCard(kana.kanaId);
          return {
            learned: [...state.learned, kana.kanaId],
            cards: [
              ...state.cards,
              {
                ...base,
                contentId: kana.kanaId,
                kind: "kana",
                front: kana.character,
                reading: kana.romaji,
                meaning: kana.romaji,
                kanaId: kana.kanaId,
                character: kana.character,
                romaji: kana.romaji,
                script: kana.script,
              },
            ],
          };
        }),
      addVocabulary: (item) =>
        set((state) => {
          const id = `vocab-${item.id}`;
          if (state.cards.some((card) => card.id === id)) return state;
          return {
            cards: [
              ...state.cards,
              {
                ...createSrsCard(id),
                contentId: item.id,
                kind: "vocabulary",
                front: item.word,
                reading: item.reading,
                meaning: item.meaning,
                example: item.example,
                exampleMeaning: item.exampleMeaning,
              },
            ],
          };
        }),
      gradeKana: (id, grade, now = new Date()) =>
        set((state) => {
          const quest = advanceDailyQuest(state, "review");
          return {
            questDate: quest.questDate,
            questCounts: quest.questCounts,
            completedQuests: quest.completedQuests,
            streak: quest.streak,
            cards: state.cards.map((card) =>
              card.id === id ? { ...scheduleReview(card, grade, now) } : card,
            ),
            xp:
              state.xp +
              quest.reward +
              (grade === "again" ? 0 : grade === "easy" ? 12 : grade === "good" ? 8 : 4),
          };
        }),
      completeLesson: (id, earnedXp) =>
        set((state) => {
          if (state.completedLessons.includes(id)) return state;
          const quest = advanceDailyQuest(state, "lesson");
          const weekly = advanceWeeklyQuest(state.weeklyQuest);
          return {
            questDate: quest.questDate,
            questCounts: quest.questCounts,
            completedQuests: quest.completedQuests,
            streak: quest.streak,
            weeklyQuest: {
              weekKey: weekly.weekKey,
              count: weekly.count,
              completed: weekly.completed,
            },
            completedLessons: [...state.completedLessons, id],
            lessonCompletions: [...state.lessonCompletions, { id, date: new Date().toISOString() }],
            xp: state.xp + earnedXp + quest.reward + weekly.reward,
          };
        }),
      setPlacement: (score, skipped) => set({ placementScore: score, skippedLessons: skipped }),
      recordQuestProgress: (kind, amount = 1) =>
        set((state) => {
          const quest = advanceDailyQuest(state, kind, amount);
          return {
            questDate: quest.questDate,
            questCounts: quest.questCounts,
            completedQuests: quest.completedQuests,
            streak: quest.streak,
            xp: state.xp + quest.reward,
          };
        }),
      mergeAccountSnapshot: (snapshot) =>
        set((state) => ({
          xp: Math.max(state.xp, snapshot.xp),
          completedLessons: [...new Set([...state.completedLessons, ...snapshot.completedLessons])],
          lessonCompletions: [
            ...new Map(
              [...state.lessonCompletions, ...(snapshot.lessonCompletions ?? [])].map((item) => [
                item.id,
                item,
              ]),
            ).values(),
          ],
          cards: [
            ...new Map([...state.cards, ...snapshot.cards].map((card) => [card.id, card])).values(),
          ],
          streak: snapshot.streak ?? state.streak,
          weeklyQuest: {
            weekKey: localWeekKey(),
            count: Math.max(
              state.weeklyQuest.weekKey === localWeekKey() ? state.weeklyQuest.count : 0,
              Math.min(
                3,
                (snapshot.lessonCompletions ?? []).filter(
                  (item) => localWeekKey(new Date(item.date)) === localWeekKey(),
                ).length,
              ),
            ),
            completed:
              state.weeklyQuest.weekKey === localWeekKey()
                ? state.weeklyQuest.completed ||
                  (snapshot.lessonCompletions ?? []).filter(
                    (item) => localWeekKey(new Date(item.date)) === localWeekKey(),
                  ).length >= 3
                : (snapshot.lessonCompletions ?? []).filter(
                    (item) => localWeekKey(new Date(item.date)) === localWeekKey(),
                  ).length >= 3,
          },
        })),
    }),
    {
      name: "nihongo-nest:learning",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        learned: state.learned,
        cards: state.cards,
        xp: state.xp,
        completedLessons: state.completedLessons,
        lessonCompletions: state.lessonCompletions,
        skippedLessons: state.skippedLessons,
        placementScore: state.placementScore,
        questDate: state.questDate,
        questCounts: state.questCounts,
        completedQuests: state.completedQuests,
        streak: state.streak,
        weeklyQuest: state.weeklyQuest,
      }),
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as Partial<Omit<LearningState, "cards">> & {
          cards?: (Partial<StudyCard> & {
            id: string;
            character?: string;
            romaji?: string;
            kanaId?: string;
          })[];
        };
        if (version < 2) {
          state.cards = (state.cards ?? []).map(
            (card) =>
              ({
                ...card,
                kind: "kana",
                contentId: card.contentId ?? card.kanaId ?? card.id,
                front: card.front ?? card.character ?? "",
                reading: card.reading ?? card.romaji ?? "",
                meaning: card.meaning ?? card.romaji ?? "",
              }) as StudyCard,
          );
        }
        if (version < 3) {
          (state as Partial<LearningState>).questDate = todayKey();
          (state as Partial<LearningState>).questCounts = { review: 0, lesson: 0, minutes: 0 };
          (state as Partial<LearningState>).completedQuests = [];
          (state as Partial<LearningState>).streak = {
            currentDays: 0,
            longestDays: 0,
            lastActivityAt: null,
            freezesAvailable: 1,
          };
          (state as Partial<LearningState>).lessonCompletions = [];
          (state as Partial<LearningState>).weeklyQuest = {
            weekKey: localWeekKey(),
            count: 0,
            completed: false,
          };
        }
        if (version < 4) {
          (state as Partial<LearningState>).weeklyQuest = {
            weekKey: localWeekKey(),
            count: 0,
            completed: false,
          };
          (state as Partial<LearningState>).lessonCompletions ??= [];
        }
        return state as LearningState;
      },
    },
  ),
);
