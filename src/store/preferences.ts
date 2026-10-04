"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AgeMode = "kids" | "teens" | "adults";
export type LearningGoal = "travel" | "anime" | "jlpt" | "work" | "fun";

type Preferences = {
  ageMode: AgeMode;
  goal: LearningGoal | null;
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  hydrated: boolean;
  setProfile: (ageMode: AgeMode, goal: LearningGoal) => void;
  setAgeMode: (ageMode: AgeMode) => void;
  setSetting: <K extends "fontScale" | "highContrast" | "reducedMotion" | "dyslexiaFont">(
    key: K,
    value: Preferences[K],
  ) => void;
  setHydrated: () => void;
};

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      ageMode: "adults",
      goal: null,
      fontScale: 1,
      highContrast: false,
      reducedMotion: false,
      dyslexiaFont: false,
      hydrated: false,
      setProfile: (ageMode, goal) => set({ ageMode, goal }),
      setAgeMode: (ageMode) => set({ ageMode }),
      setSetting: (key, value) => set({ [key]: value }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "nihongo-nest:preferences",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        ageMode: state.ageMode,
        goal: state.goal,
        fontScale: state.fontScale,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
        dyslexiaFont: state.dyslexiaFont,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
