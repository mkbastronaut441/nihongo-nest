"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";

export default function QuickLessonPage() {
  const [seconds, setSeconds] = useState(300);
  const [started, setStarted] = useState(false);
  const muted = usePreferences((state) => state.soundMuted);
  useEffect(() => {
    if (!started || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, seconds]);
  const recordQuestProgress = useLearning((state) => state.recordQuestProgress);
  useEffect(() => {
    if (seconds === 0) {
      recordQuestProgress("minutes", 5);
      if (!muted && "vibrate" in navigator) navigator.vibrate(80);
    }
  }, [seconds, recordQuestProgress, muted]);
  return (
    <main className="interior-page wrap quick-lesson">
      <Card>
        <span className="eyebrow">FIVE-MINUTE DAILY LESSON</span>
        <h1>
          {seconds === 0 ? "A lovely little learning session!" : "A small moment for Japanese"}
        </h1>
        <p>
          {seconds === 0
            ? "You showed up for your learning today. That’s something to feel good about."
            : "Settle in, review a few cards, or explore a lesson at your own pace."}
        </p>
        <div className="quick-clock" aria-live="polite">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </div>
        {seconds > 0 && (
          <button className="button button--primary" onClick={() => setStarted(true)}>
            {started ? "Your cozy timer is running" : "Start five minutes"}
          </button>
        )}
        <Link href="/review">Review a few cards →</Link>
        <Link href="/lesson-player?lesson=g01-desu">Open a grammar lesson →</Link>
      </Card>
    </main>
  );
}
