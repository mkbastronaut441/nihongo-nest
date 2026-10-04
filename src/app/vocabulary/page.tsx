"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { speakKana } from "@/lib/kana";
import { vocabulary } from "@/lib/phase3-content";
import { useLearning } from "@/store/learning";

export default function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const cards = useLearning((state) => state.cards);
  const addVocabulary = useLearning((state) => state.addVocabulary);
  const filtered = useMemo(
    () =>
      vocabulary.filter((entry) =>
        `${entry.word} ${entry.reading} ${entry.meaning}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const item = filtered[index];
  const cardId = item ? `vocab-${item.id}` : "";
  const queued = cards.some((card) => card.id === cardId);
  const move = (direction: number) => {
    setIndex((current) => (current + direction + filtered.length) % filtered.length);
    setRevealed(false);
  };
  return (
    <main id="main-content" className="wrap learning-page">
      <Link href="/learning-map" className="back-link">
        <ArrowLeft size={16} /> Learning map
      </Link>
      <div className="learning-heading">
        <div>
          <span className="eyebrow">N5 WORD DECK · {vocabulary.length} WORDS</span>
          <h1>Word garden</h1>
          <p>
            Flip through beginner words, hear them aloud, and tuck tricky ones into your review
            nest.
          </p>
        </div>
        <Link href="/review" className="learning-count">
          Review nest →
        </Link>
      </div>
      <div className="vocab-tools">
        <label htmlFor="vocab-search">Find a word</label>
        <input
          id="vocab-search"
          type="search"
          placeholder="Japanese, reading, or meaning"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
            setRevealed(false);
          }}
        />
        <span>{filtered.length} words</span>
      </div>
      {item ? (
        <Card className="vocab-flashcard">
          <div className="vocab-card-top">
            <span className="eyebrow">N5 · {item.partOfSpeech}</span>
            <span>
              {index + 1} / {filtered.length}
            </span>
          </div>
          <button
            className="vocab-audio"
            onClick={() => speakKana(item.word)}
            aria-label={`Hear ${item.word}`}
          >
            <Volume2 size={20} /> Listen
          </button>
          <div className="vocab-front">{item.word}</div>
          {revealed ? (
            <div className="vocab-back" aria-live="polite">
              <p className="vocab-reading">{item.reading}</p>
              <p className="vocab-meaning">{item.meaning}</p>
              <div className="vocab-example">
                <strong>{item.example}</strong>
                <span>{item.exampleMeaning}</span>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setRevealed(true)}>
              Show meaning
            </Button>
          )}
          <div className="vocab-actions">
            <Button
              variant="secondary"
              disabled={!revealed || queued}
              onClick={() => addVocabulary(item)}
            >
              {queued ? "In your review nest ✓" : "Add to review"}
            </Button>
            <Button onClick={() => move(1)}>
              Next word <ArrowRight size={17} />
            </Button>
          </div>
          <div className="vocab-paging">
            <button onClick={() => move(-1)} aria-label="Previous word">
              <ArrowLeft size={17} />
            </button>
            <span className="progress-track">
              <span
                className="progress-fill"
                style={{ width: `${((index + 1) / filtered.length) * 100}%` }}
              />
            </span>
            <button onClick={() => move(1)} aria-label="Next word">
              <ArrowRight size={17} />
            </button>
          </div>
        </Card>
      ) : (
        <Card className="review-empty">
          <h2>No words found</h2>
          <p>Try a Japanese word, reading, or English meaning.</p>
        </Card>
      )}
    </main>
  );
}
