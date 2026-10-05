"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { usePreferences } from "@/store/preferences";

type Entry = { nickname: string | null; xp: number };
export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const optedIn = usePreferences((state) => state.leaderboardOptIn);
  useEffect(() => {
    let active = true;
    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((data: { entries?: Entry[] }) => {
        if (active) setEntries(data.entries ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main id="main-content" className="interior-page wrap leaderboard-page">
      <span className="eyebrow">A FRIENDLY LITTLE CHALLENGE</span>
      <h1>Community board</h1>
      <p>Joining is optional. Only learner nicknames and XP are shown.</p>
      {!optedIn && (
        <Card className="privacy-note">
          <strong>Your learning stays private.</strong>
          <p>
            Turn on the friendly leaderboard and choose a nickname in settings if you’d like to
            join.
          </p>
          <Link href="/settings">Choose your leaderboard settings →</Link>
        </Card>
      )}
      <Card>
        <ol className="leaderboard-list">
          {entries.map((entry, index) => (
            <li key={`${entry.nickname}-${index}`}>
              <span className="leader-rank">{index + 1}</span>
              <span>{entry.nickname || "Nest explorer"}</span>
              <strong>{entry.xp} XP</strong>
            </li>
          ))}
        </ol>
        {loading && <p>Gathering today’s learners…</p>}
        {!loading && !entries.length && (
          <p>No opt-in learners yet. Your spot is waiting if you’d like to join.</p>
        )}
      </Card>
    </main>
  );
}
