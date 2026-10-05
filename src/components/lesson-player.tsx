"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button, Card, ProgressBar } from "@/components/ui";
import { KanaTracer } from "@/components/kana-tracer";
import { speakKana } from "@/lib/kana";
import { grammarLessons, type GrammarLesson, type GrammarStep } from "@/lib/phase3-content";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";
import { playCelebration } from "@/lib/sound";

const clean = (value: string) => value.trim().replace(/[。？！?！\s]/g, "");

export function LessonPlayer({ lessonId }: { lessonId?: string }) {
  const lesson = grammarLessons.find((item) => item.id === lessonId);
  const done = useLearning((state) => state.completedLessons);
  const skipped = useLearning((state) => state.skippedLessons);
  if (!lesson) return <LessonShelf done={done} skipped={skipped} />;
  return <LessonRun lesson={lesson} />;
}

function LessonShelf({ done, skipped }: { done: string[]; skipped: string[] }) {
  return (
    <main id="main-content" className="wrap learning-page">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">BEGINNER GRAMMAR · 10 MINI LESSONS</span>
          <h1>Build your Japanese</h1>
          <p>Short, interactive lessons with kind feedback and room to try again.</p>
        </div>
        <Link className="learning-count" href="/learning-map">
          Learning map →
        </Link>
      </div>
      <div className="lesson-shelf">
        {grammarLessons.map((lesson, index) => {
          const completed = done.includes(lesson.id);
          const placed = skipped.includes(lesson.id);
          return (
            <Card className="lesson-shelf-card" key={lesson.id}>
              <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="lesson-shelf-copy">
                <span className="eyebrow">GRAMMAR · {lesson.steps.length} STEPS</span>
                <h2>{lesson.title}</h2>
                <p>{lesson.summary}</p>
                {completed && (
                  <span className="lesson-status">
                    <CheckCircle2 size={15} /> Complete
                  </span>
                )}
                {placed && <span className="lesson-status">Placement check: already familiar</span>}
              </div>
              <Link
                className="button button--secondary"
                href={`/lesson-player?lesson=${lesson.id}`}
              >
                {completed || placed ? "Review" : "Start"}
                <ArrowRight size={16} />
              </Link>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

function LessonRun({ lesson }: { lesson: GrammarLesson }) {
  const reducedMotion = usePreferences((state) => state.reducedMotion);
  const soundMuted = usePreferences((state) => state.soundMuted);
  const completeLesson = useLearning((state) => state.completeLesson);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [dragToken, setDragToken] = useState<string | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const step = lesson.steps[stepIndex];
  const percentage = ((stepIndex + (complete ? 1 : 0)) / lesson.steps.length) * 100;
  const selectedCorrectly = (value: string) => {
    const correct = value === step.answer;
    setAnswer(value);
    setAnswered(true);
    setFeedback(
      correct
        ? (step.feedback ?? "That’s right! You’ve got this.")
        : "Good try. Have another look at the example, then keep going.",
    );
    if (correct) setScore((value) => value + 1);
  };
  const next = () => {
    if (stepIndex + 1 === lesson.steps.length) {
      const xp = 20 + score * 5;
      completeLesson(lesson.id, xp);
      if (!soundMuted) playCelebration();
      setComplete(true);
      return;
    }
    setStepIndex((value) => value + 1);
    setAnswer("");
    setFeedback("");
    setAnswered(false);
    setSentence([]);
    setSelectedLeft(null);
    setMatched([]);
  };
  const checkText = () => {
    const accepted = (step.answers ?? [step.answer ?? ""]).some(
      (item) => clean(item) === clean(answer),
    );
    setFeedback(
      accepted
        ? (step.feedback ?? "Nice work! That fits.")
        : `Not quite. ${step.hint ?? "Take another look at the pattern and keep going."}`,
    );
    if (accepted) {
      setAnswered(true);
      setScore((value) => value + 1);
    }
  };
  const builderIsCorrect = useMemo(
    () => sentence.join("") === step.answer,
    [sentence, step.answer],
  );
  const checkBuilder = () => {
    setFeedback(
      builderIsCorrect
        ? "Beautiful sentence! The pieces are in the right order."
        : "Good try! You can rearrange the pieces and check again.",
    );
    if (builderIsCorrect) {
      setAnswered(true);
      setScore((value) => value + 1);
    }
  };
  const appendToken = (token: string) => setSentence((value) => [...value, token]);
  const removeToken = (index: number) =>
    setSentence((value) => value.filter((_, position) => position !== index));

  if (complete)
    return (
      <LessonCelebration
        lesson={lesson}
        score={score}
        stepCount={lesson.steps.length}
        reducedMotion={reducedMotion}
      />
    );

  return (
    <main id="main-content" className="wrap learning-page lesson-run-page">
      <Link href="/lesson-player" className="back-link">
        <ArrowLeft size={16} /> All lessons
      </Link>
      <div className="lesson-run-heading">
        <div>
          <span className="eyebrow">{lesson.title}</span>
          <h1>{step.title ?? step.prompt ?? "A little practice"}</h1>
        </div>
        <span className="lesson-step-count">
          {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>
      <ProgressBar value={percentage} label="Lesson progress" />
      <Card className="lesson-step-card" key={`${lesson.id}-${stepIndex}`}>
        <div className="lesson-step-type">{step.type.replaceAll("-", " ")}</div>
        <StepBody
          step={step}
          answered={answered}
          answer={answer}
          setAnswer={setAnswer}
          onChoice={selectedCorrectly}
          onTextCheck={checkText}
          sentence={sentence}
          appendToken={appendToken}
          removeToken={removeToken}
          builderCorrect={builderIsCorrect}
          onBuilderCheck={checkBuilder}
          dragToken={dragToken}
          setDragToken={setDragToken}
          onMatch={(good, doneText) => {
            if (good) {
              setScore((value) => value + 1);
              setFeedback(doneText);
              setAnswered(true);
            } else {
              setFeedback("So close! Try pairing those again.");
            }
          }}
          selectedLeft={selectedLeft}
          setSelectedLeft={setSelectedLeft}
          matched={matched}
          setMatched={setMatched}
          onTraceSuccess={() => {
            if (!answered) {
              setAnswered(true);
              setScore((value) => value + 1);
              setFeedback("Lovely tracing! You found the shape.");
            }
          }}
        />
        {feedback && (
          <p className={`lesson-feedback ${answered ? "is-kind" : ""}`} role="status">
            {feedback}
          </p>
        )}
        <div className="lesson-step-footer">
          <span className="eyebrow">✨ Every try helps it stick</span>
          <Button onClick={next} disabled={!answered && step.type !== "intro"}>
            {stepIndex + 1 === lesson.steps.length ? "Finish lesson" : "Continue"}
            <ArrowRight size={17} />
          </Button>
        </div>
      </Card>
    </main>
  );
}

function StepBody({
  step,
  answered,
  answer,
  setAnswer,
  onChoice,
  onTextCheck,
  sentence,
  appendToken,
  removeToken,
  builderCorrect,
  onBuilderCheck,
  dragToken,
  setDragToken,
  onMatch,
  selectedLeft,
  setSelectedLeft,
  matched,
  setMatched,
  onTraceSuccess,
}: {
  step: GrammarStep;
  answered: boolean;
  answer: string;
  setAnswer: (value: string) => void;
  onChoice: (value: string) => void;
  onTextCheck: () => void;
  sentence: string[];
  appendToken: (value: string) => void;
  removeToken: (index: number) => void;
  builderCorrect: boolean;
  onBuilderCheck: () => void;
  dragToken: string | null;
  setDragToken: (value: string | null) => void;
  onMatch: (good: boolean, doneText: string) => void;
  selectedLeft: string | null;
  setSelectedLeft: (value: string | null) => void;
  matched: string[];
  setMatched: (value: string[]) => void;
  onTraceSuccess: () => void;
}) {
  if (step.type === "intro")
    return (
      <div className="lesson-intro">
        <p>{step.body}</p>
        {step.japanese && (
          <div className="lesson-example">
            <strong>{step.japanese}</strong>
            <span>{step.reading}</span>
            <span>{step.meaning}</span>
            <button onClick={() => speakKana(step.japanese!)} aria-label="Hear Japanese example">
              🔊 Hear it
            </button>
          </div>
        )}
      </div>
    );
  if (step.type === "multiple-choice" || step.type === "listen-pick")
    return (
      <div className="lesson-question">
        <p>{step.prompt}</p>
        {step.type === "listen-pick" && (
          <Button variant="secondary" onClick={() => speakKana(step.audio ?? "")}>
            🔊 Play the sound
          </Button>
        )}
        <div className="lesson-options">
          {step.options?.map((option) => (
            <button
              key={option}
              className={`lesson-option ${answer === option ? "is-selected" : ""}`}
              aria-pressed={answer === option}
              onClick={() => !answered && onChoice(option)}
            >
              {option}
              {answer === option && answered && option === step.answer && (
                <CheckCircle2 size={17} />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  if (step.type === "type-answer")
    return (
      <form
        className="lesson-type-answer"
        onSubmit={(event) => {
          event.preventDefault();
          if (!answered) onTextCheck();
        }}
      >
        <label htmlFor="lesson-answer">{step.prompt}</label>
        <input
          id="lesson-answer"
          autoComplete="off"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type your answer"
        />
        <small>{step.hint}</small>
        <Button type="submit" disabled={!answer.trim() || answered}>
          Check answer
        </Button>
      </form>
    );
  if (step.type === "sentence-builder")
    return (
      <div className="sentence-builder">
        <p>{step.prompt}</p>
        <div
          className="sentence-drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragToken) appendToken(dragToken);
            setDragToken(null);
          }}
          aria-label="Your sentence, click or drop tokens here"
        >
          {sentence.length ? (
            sentence.map((token, index) => (
              <button
                key={`${token}-${index}`}
                onClick={() => removeToken(index)}
                title="Remove sentence token"
              >
                {token} ×
              </button>
            ))
          ) : (
            <span>Tap or drop words into this sentence space</span>
          )}
        </div>
        <div className="sentence-tokens">
          {step.tokens?.map((token, index) => (
            <button
              key={`${token}-${index}`}
              draggable
              onDragStart={() => setDragToken(token)}
              onClick={() => appendToken(token)}
            >
              {token}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          onClick={onBuilderCheck}
          disabled={answered || !sentence.length}
        >
          Check my sentence
        </Button>
        {answered && builderCorrect && <p className="builder-translation">{step.translation}</p>}
      </div>
    );
  if (step.type === "match-pairs")
    return (
      <div className="match-game">
        <p>{step.prompt}</p>
        <div className="match-columns">
          <div>
            {step.pairs?.map((pair) => (
              <button
                key={pair.left}
                disabled={matched.includes(pair.left)}
                className={selectedLeft === pair.left ? "is-selected" : ""}
                onClick={() => setSelectedLeft(pair.left)}
              >
                {pair.left}
              </button>
            ))}
          </div>
          <div>
            {[...(step.pairs ?? [])].reverse().map((pair) => (
              <button
                key={pair.right}
                disabled={matched.includes(pair.left)}
                onClick={() => {
                  if (!selectedLeft) return;
                  const correct =
                    step.pairs?.find((item) => item.left === selectedLeft)?.right === pair.right;
                  if (correct) {
                    const next = [...matched, selectedLeft];
                    setMatched(next);
                    setSelectedLeft(null);
                    if (next.length === step.pairs?.length)
                      onMatch(true, step.feedback ?? "Great matches!");
                  } else {
                    onMatch(false, "");
                    setSelectedLeft(null);
                  }
                }}
              >
                {pair.right}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  if (step.type === "tracing" && step.character && step.strokes)
    return (
      <div className="lesson-tracing">
        <p>{step.prompt}</p>
        <KanaTracer character={step.character} strokes={step.strokes} onSuccess={onTraceSuccess} />
      </div>
    );
  return <p>This practice step is still taking shape.</p>;
}

function LessonCelebration({
  lesson,
  score,
  stepCount,
  reducedMotion,
}: {
  lesson: GrammarLesson;
  score: number;
  stepCount: number;
  reducedMotion: boolean;
}) {
  const completed = useLearning((state) => state.completedLessons);
  const alreadyDone = completed.includes(lesson.id);
  return (
    <main id="main-content" className="wrap learning-page">
      <Card className="lesson-celebration">
        <motion.div
          className="celebration-burst"
          initial={reducedMotion ? false : { scale: 0.65, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.45 }}
          aria-hidden="true"
        >
          {score >= 2 ? "🎉" : "🌸"}
        </motion.div>
        <span className="eyebrow">{alreadyDone ? "A LOVELY REVIEW" : "LESSON COMPLETE"}</span>
        <h1>{score >= 2 ? "Look at you go!" : "You showed up and learned."}</h1>
        <p>{lesson.title}</p>
        <div className="celebration-summary">
          <div>
            <strong>{score}</strong>
            <span>practice wins</span>
          </div>
          <div>
            <strong>{stepCount}</strong>
            <span>steps explored</span>
          </div>
          <div>
            <strong>{20 + score * 5}</strong>
            <span>XP earned</span>
          </div>
        </div>
        <p className="lesson-takeaway">
          <Sparkles size={17} />
          {lesson.concept}
        </p>
        <div className="celebration-actions">
          <Link className="button button--secondary" href="/lesson-player">
            More lessons
          </Link>
          <Link className="button button--primary" href="/dashboard">
            Back to nest
          </Link>
        </div>
      </Card>
    </main>
  );
}
