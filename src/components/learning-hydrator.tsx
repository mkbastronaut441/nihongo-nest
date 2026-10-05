"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";
import type { StudyCard } from "@/store/learning";
import { localDateKey } from "@/lib/gamification";

const ageModeFor = (value?: string) =>
  value === "KIDS" ? "kids" : value === "TEENS" ? "teens" : "adults";
const goalFor = (value?: string) =>
  (({ TRAVEL: "travel", ANIME_MANGA: "anime", JLPT: "jlpt", WORK: "work", FUN: "fun" }) as const)[
    value as "TRAVEL" | "ANIME_MANGA" | "JLPT" | "WORK" | "FUN"
  ];

export function LearningHydrator() {
  const { status } = useSession();
  useEffect(() => {
    void useLearning.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    let timer: number | undefined;
    let unsubscribeLearning = () => {};
    let unsubscribePreferences = () => {};
    const save = (activity: boolean) => {
      if (!active) return;
      const state = useLearning.getState();
      const prefs = usePreferences.getState();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void fetch("/api/profile/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ageMode: prefs.ageMode,
            goal: prefs.goal ?? "fun",
            fontScale: prefs.fontScale,
            highContrast: prefs.highContrast,
            reducedMotion: prefs.reducedMotion,
            dyslexiaFont: prefs.dyslexiaFont,
            soundMuted: prefs.soundMuted,
            leaderboardOptIn: prefs.leaderboardOptIn,
            publicNickname: prefs.publicNickname,
            mascotOutfit: prefs.mascotOutfit,
            mascotColor: prefs.mascotColor,
          }),
        });
        void fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xp: state.xp,
            completedLessons: state.completedLessons,
            lessonCompletions: state.lessonCompletions,
            cards: state.cards,
            questDate: state.questDate,
            questCounts: state.questCounts,
            completedQuests: state.completedQuests,
            activityDate: localDateKey(),
            activity,
          }),
        });
      }, 800);
    };
    void (async () => {
      await Promise.all([useLearning.persist.rehydrate(), usePreferences.persist.rehydrate()]);
      try {
        const response = await fetch("/api/sync");
        if (response.ok && active) {
          const snapshot = (await response.json()) as {
            xp?: number;
            completedLessons?: string[];
            cards?: StudyCard[];
            lessonCompletions?: { id: string; date: string }[];
            streak?: {
              currentDays: number;
              longestDays: number;
              lastActivityAt: string | null;
              freezesAvailable: number;
            } | null;
            profile?: Record<string, unknown> | null;
          };
          useLearning.getState().mergeAccountSnapshot({
            xp: snapshot.xp ?? 0,
            completedLessons: snapshot.completedLessons ?? [],
            lessonCompletions: snapshot.lessonCompletions ?? [],
            cards: snapshot.cards ?? [],
            streak: snapshot.streak,
          });
          if (snapshot.profile) {
            usePreferences.setState({
              ageMode: ageModeFor(snapshot.profile.ageGroup as string),
              goal: goalFor(snapshot.profile.goal as string) ?? "fun",
              fontScale: snapshot.profile.fontScale as number,
              highContrast: snapshot.profile.highContrast as boolean,
              reducedMotion: snapshot.profile.reducedMotion as boolean,
              dyslexiaFont: snapshot.profile.dyslexiaFont as boolean,
              soundMuted: snapshot.profile.soundMuted as boolean,
              leaderboardOptIn: snapshot.profile.leaderboardOptIn as boolean,
              publicNickname: (snapshot.profile.publicNickname as string) ?? "",
              mascotOutfit: snapshot.profile.mascotOutfit as string,
              mascotColor: snapshot.profile.mascotColor as string,
            });
          }
        }
      } catch {
        /* The guest copy remains usable and will retry on the next session. */
      }
      if (!active) return;
      unsubscribeLearning = useLearning.subscribe(() => save(true));
      unsubscribePreferences = usePreferences.subscribe(() => save(false));
      save(false);
    })();
    return () => {
      active = false;
      window.clearTimeout(timer);
      unsubscribeLearning();
      unsubscribePreferences();
    };
  }, [status]);
  return null;
}
