"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { getDueCards, getDueTodayCards, type Grade } from "@/lib/srs/engine";
import { speakKana } from "@/lib/kana";
import { useLearning } from "@/store/learning";

const grades: { label: string; value: Grade; hint: string }[] = [
  { label: "Again", value: "again", hint: "10 min" },
  { label: "Hard", value: "hard", hint: "A little tough" },
  { label: "Good", value: "good", hint: "Felt right" },
  { label: "Easy", value: "easy", hint: "Had it!" },
];
export default function ReviewPage() {
  const cards = useLearning((state) => state.cards);
  const xp = useLearning((state) => state.xp);
  const gradeKana = useLearning((state) => state.gradeKana);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const due = useMemo(() => getDueCards(cards), [cards]);
  const dueToday = useMemo(() => getDueTodayCards(cards), [cards]);
  const current = due[index];
  const grade = (value: Grade) => {
    if (!current) return;
    gradeKana(current.id, value);
    setDone((n) => n + 1);
    setIndex(0);
    setShowAnswer(false);
  };
  return (
    <main id="main-content" className="wrap learning-page">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">A LITTLE REVIEW GOES A LONG WAY</span>
          <h1>Your review nest</h1>
          <p>Short, kind practice to help kana stick in your memory.</p>
        </div>
        <span className="learning-count">✨ {xp} XP</span>
      </div>
      <div className="review-stats">
        <Card>
          <strong>{due.length}</strong>
          <span>due right now</span>
        </Card>
        <Card>
          <strong>{dueToday.length}</strong>
          <span>due today</span>
        </Card>
        <Card>
          <strong>{cards.length}</strong>
          <span>in your nest</span>
        </Card>
      </div>
      {current ? (
        <Card className="review-card">
          <span className="eyebrow">
            {current.kind} · {index + 1} OF {due.length}
          </span>
          <button
            className="review-audio"
            onClick={() => speakKana(current.front)}
            aria-label={`Hear ${current.front}`}
          >
            🔊
          </button>
          <div className="review-character">{current.front}</div>
          <p className="review-prompt">Try to remember the reading and meaning, then check.</p>
          {showAnswer ? (
            <div className="review-answer" aria-live="polite">
              <span>{current.reading}</span>
              <span>{current.meaning}</span>
              {current.example && (
                <small>
                  {current.example}
                  <br />
                  {current.exampleMeaning}
                </small>
              )}
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowAnswer(true)}>
              Show answer
            </Button>
          )}
          <div className="grade-grid">
            {grades.map((item) => (
              <Button
                key={item.value}
                variant="secondary"
                disabled={!showAnswer}
                onClick={() => grade(item.value)}
              >
                <span>
                  {item.label}
                  <small>{item.hint}</small>
                </span>
              </Button>
            ))}
          </div>
          <p className="review-note">
            No score pressure here — a tricky card simply comes back sooner.
          </p>
        </Card>
      ) : (
        <Card className="review-empty">
          <span className="empty-sparkle">🌸</span>
          <h2>{done ? "Beautifully done!" : "Your review nest is peaceful"}</h2>
          <p>
            {done
              ? `You reviewed ${done} ${done === 1 ? "card" : "cards"}. Take a breath and enjoy that progress.`
              : cards.length
                ? "Nothing is due right now. Your cards will return at the right time."
                : "Explore the kana garden or word garden. Characters and words you practice can join your review nest."}
          </p>
          {!cards.length && (
            <div className="celebration-actions">
              <Link className="button button--primary button--large" href="/kana-kanji-explorer">
                Explore kana
              </Link>
              <Link className="button button--secondary button--large" href="/vocabulary">
                Explore words
              </Link>
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
