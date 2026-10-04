"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { kanaEntries, speakKana } from "@/lib/kana";
import { usePreferences } from "@/store/preferences";

export type GameKind = "memory" | "sound" | "falling";
const pool = kanaEntries.filter((item) => item.script === "hiragana" && item.category === "basic");
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function KanaGames({ kind }: { kind: GameKind }) {
  const ageMode = usePreferences((state) => state.ageMode);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Pick a level and let’s play!");
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [running, setRunning] = useState(false);
  const pairCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
  const memoryCards = useMemo(() => {
    const rotated = [...pool.slice(round % pool.length), ...pool.slice(0, round % pool.length)];
    return shuffle(rotated)
      .slice(0, pairCount)
      .flatMap((entry, pair) => [
        { key: `${pair}-kana`, pair, face: entry.character },
        { key: `${pair}-roma`, pair, face: entry.romaji },
      ])
      .sort(() => Math.random() - 0.5);
  }, [pairCount, round]);
  const soundTarget = useMemo(() => shuffle(pool)[round % pool.length], [round]);
  const fallingChoices = useMemo(
    () =>
      shuffle([
        soundTarget,
        ...shuffle(pool.filter((item) => item.id !== soundTarget.id)).slice(
          0,
          difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5,
        ),
      ]),
    [soundTarget, difficulty],
  );
  useEffect(() => {
    if (!running || kind !== "falling") return;
    const timer = window.setInterval(
      () =>
        setSeconds((value) => {
          if (value <= 1) {
            setRunning(false);
            setMessage(
              `Lovely play! You found ${score} ${score === 1 ? "character" : "characters"}.`,
            );
            return 0;
          }
          return value - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [running, kind, score]);
  const chooseMemory = (index: number) => {
    if (picked.includes(index) || matched.includes(index) || picked.length === 2) return;
    const next = [...picked, index];
    setPicked(next);
    if (next.length === 2) {
      const [first, second] = next.map((i) => memoryCards[i]);
      if (first.pair === second.pair) {
        setMatched((old) => [...old, ...next]);
        setScore((n) => n + 1);
        setMessage("A perfect pair! 🌟");
        window.setTimeout(() => setPicked([]), 450);
      } else {
        setMessage("Almost! Give it another try.");
        window.setTimeout(() => setPicked([]), 700);
      }
    }
  };
  const reset = () => {
    setScore(0);
    setRound((value) => value + 1);
    setMatched([]);
    setPicked([]);
    setSeconds(30);
    setRunning(kind === "falling");
    setMessage("New round! You’ve got this.");
  };
  const goodAnswer = () => {
    setScore((n) => n + 1);
    setMessage("That’s it! Nice listening. ✨");
    setRound((n) => n + 1);
  };
  const header =
    kind === "memory"
      ? ["Kana memory match", "Pair each character with its romaji."]
      : kind === "sound"
        ? ["Sound catcher", "Listen closely, then pick the character you hear."]
        : ["Falling kana", "Catch the character that matches the sound before time runs out."];
  return (
    <main id="main-content" className="wrap learning-page">
      <Link href="/games-hub" className="back-link">
        <ArrowLeft size={16} /> Game garden
      </Link>
      <div className="learning-heading">
        <div>
          <span className="eyebrow">PLAY · PRACTICE · REPEAT</span>
          <h1>{header[0]}</h1>
          <p>{header[1]}</p>
        </div>
        <span className="game-score">⭐ {score}</span>
      </div>
      <Card className="game-panel" data-game-age={ageMode}>
        <div className="game-toolbar">
          <div role="group" aria-label="Difficulty" className="difficulty-control">
            {(["easy", "medium", "hard"] as const).map((level) => (
              <button
                key={level}
                aria-pressed={difficulty === level}
                onClick={() => {
                  setDifficulty(level);
                  setRound((n) => n + 1);
                  setMatched([]);
                  setPicked([]);
                  setScore(0);
                  setMessage("Ready when you are!");
                }}
              >
                {level === "easy" ? "🌱 Easy" : level === "medium" ? "🌸 Medium" : "🔥 Challenge"}
              </button>
            ))}
          </div>
          <span className="eyebrow">
            {kind === "falling" ? `${seconds}s left` : `${difficulty.toUpperCase()} MODE`}
          </span>
        </div>
        {kind === "memory" && (
          <>
            <div className="memory-grid">
              {memoryCards.map((card, index) => (
                <button
                  key={card.key}
                  className={`memory-tile ${picked.includes(index) || matched.includes(index) ? "is-flipped" : ""} ${matched.includes(index) ? "is-matched" : ""}`}
                  onClick={() => chooseMemory(index)}
                  aria-label={`Card ${index + 1}${picked.includes(index) || matched.includes(index) ? `, ${card.face}` : ", hidden"}`}
                >
                  <span>{picked.includes(index) || matched.includes(index) ? card.face : "✿"}</span>
                </button>
              ))}
            </div>
            <p className="game-message" aria-live="polite">
              {message}
            </p>
            <Button variant="secondary" onClick={reset}>
              New game
            </Button>
          </>
        )}
        {kind === "sound" && (
          <div className="sound-game">
            <button
              className="listen-button"
              onClick={() => speakKana(soundTarget.character)}
              aria-label="Play Japanese sound"
            >
              <Volume2 size={30} />
              <span>Listen again</span>
            </button>
            <div className="sound-options">
              {fallingChoices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() =>
                    choice.id === soundTarget.id
                      ? goodAnswer()
                      : setMessage("Not quite. Listen once more — you’ve got this!")
                  }
                  aria-label={`${choice.character}, ${choice.romaji}`}
                >
                  {choice.character}
                  <small>{difficulty === "hard" ? "?" : choice.romaji}</small>
                </button>
              ))}
            </div>
            <p aria-live="polite" className="game-message">
              {message}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setRound((n) => n + 1);
                setMessage("Ready for the next sound!");
              }}
            >
              Next sound
            </Button>
          </div>
        )}
        {kind === "falling" && (
          <div className="falling-game">
            <div className="falling-target">
              <span className="eyebrow">CATCH THIS SOUND</span>
              <button
                onClick={() => speakKana(soundTarget.character)}
                aria-label="Play target sound"
              >
                <Volume2 size={20} /> Listen
              </button>
              <span className="target-hidden">●</span>
            </div>
            {!running ? (
              <div className="game-start">
                <p aria-live="polite">{message}</p>
                <Button
                  size="large"
                  onClick={() => {
                    setScore(0);
                    setSeconds(30);
                    setRunning(true);
                    setMessage("Catch the right one!");
                  }}
                >
                  Start 30-second round
                </Button>
              </div>
            ) : (
              <div className="falling-lanes" aria-label="Falling character choices">
                {fallingChoices.map((choice, index) => (
                  <button
                    key={choice.id}
                    style={{ animationDelay: `${index * 0.18}s` }}
                    onClick={() =>
                      choice.id === soundTarget.id
                        ? goodAnswer()
                        : setMessage("So close! Watch for your sound again.")
                    }
                  >
                    {choice.character}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {ageMode === "kids" && (
          <p className="game-encouragement">Mochi’s cheering for every try! 🐣</p>
        )}
      </Card>
    </main>
  );
}
