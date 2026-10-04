"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSrsCard, scheduleReview, type Grade, type SrsCard } from "@/lib/srs/engine";

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
  skippedLessons: string[];
  placementScore: number | null;
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
};

export const useLearning = create<LearningState>()(
  persist(
    (set) => ({
      learned: [],
      cards: [],
      xp: 0,
      completedLessons: [],
      skippedLessons: [],
      placementScore: null,
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
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...scheduleReview(card, grade, now) } : card,
          ),
          xp: state.xp + (grade === "again" ? 0 : grade === "easy" ? 12 : grade === "good" ? 8 : 4),
        })),
      completeLesson: (id, earnedXp) =>
        set((state) =>
          state.completedLessons.includes(id)
            ? state
            : { completedLessons: [...state.completedLessons, id], xp: state.xp + earnedXp },
        ),
      setPlacement: (score, skipped) => set({ placementScore: score, skippedLessons: skipped }),
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
        skippedLessons: state.skippedLessons,
        placementScore: state.placementScore,
      }),
      version: 2,
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
        return state as LearningState;
      },
    },
  ),
);
