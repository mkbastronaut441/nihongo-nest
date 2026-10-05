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
  soundMuted: boolean;
  leaderboardOptIn: boolean;
  publicNickname: string;
  mascotOutfit: string;
  mascotColor: string;
  hydrated: boolean;
  setProfile: (ageMode: AgeMode, goal: LearningGoal) => void;
  setAgeMode: (ageMode: AgeMode) => void;
  setCustomization: (key: "publicNickname" | "mascotOutfit" | "mascotColor", value: string) => void;
  setSetting: <
    K extends
      | "fontScale"
      | "highContrast"
      | "reducedMotion"
      | "dyslexiaFont"
      | "soundMuted"
      | "leaderboardOptIn",
  >(
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
      soundMuted: false,
      leaderboardOptIn: false,
      publicNickname: "",
      mascotOutfit: "classic",
      mascotColor: "sakura",
      hydrated: false,
      setProfile: (ageMode, goal) => set({ ageMode, goal }),
      setAgeMode: (ageMode) => set({ ageMode }),
      setCustomization: (key, value) => set({ [key]: value }),
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
        soundMuted: state.soundMuted,
        leaderboardOptIn: state.leaderboardOptIn,
        publicNickname: state.publicNickname,
        mascotOutfit: state.mascotOutfit,
        mascotColor: state.mascotColor,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
