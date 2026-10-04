"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { grammarLessons } from "@/lib/phase3-content";
import { useLearning } from "@/store/learning";

const questions = [
  { prompt: "What does ねこ mean?", options: ["cat", "book", "water"], answer: "cat" },
  { prompt: "How do you read 水?", options: ["mizu", "yama", "kawa"], answer: "mizu" },
  {
    prompt: "Choose the topic particle: わたし ___ 学生です。",
    options: ["は", "を", "で"],
    answer: "は",
  },
  {
    prompt: "Which particle turns a polite sentence into a question?",
    options: ["か", "に", "が"],
    answer: "か",
  },
  {
    prompt: "How do you politely say ‘I do not drink’?",
    options: ["飲みません", "飲みます", "飲みです"],
    answer: "飲みません",
  },
];

export default function PlacementPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const setPlacement = useLearning((state) => state.setPlacement);
  const score = questions.filter((question, index) => answers[index] === question.answer).length;
  const skipCount = score >= 4 ? 3 : score >= 2 ? 1 : 0;
  const finish = () => {
    setPlacement(
      score,
      grammarLessons.slice(0, skipCount).map((lesson) => lesson.id),
    );
    router.push("/dashboard");
  };
  const skip = () => {
    setPlacement(0, []);
    router.push("/dashboard");
  };
  return (
    <main id="main-content" className="wrap placement-page">
      <Link href="/onboarding" className="back-link">
        <ArrowLeft size={16} /> Back to setup
      </Link>
      <div className="placement-heading">
        <span className="eyebrow">OPTIONAL · ABOUT 2 MINUTES</span>
        <h1>Let’s find your starting spot</h1>
        <p>Try a few quick questions. This is just to help you skip things you already know.</p>
      </div>
      {!showResult ? (
        <>
          <div className="placement-questions">
            {questions.map((question, index) => (
              <Card className="placement-question" key={question.prompt}>
                <span className="eyebrow">
                  QUESTION {index + 1} OF {questions.length}
                </span>
                <h2>{question.prompt}</h2>
                <div>
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((old) => ({ ...old, [index]: option }))}
                      aria-pressed={answers[index] === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <div className="placement-actions">
            <Button variant="quiet" onClick={skip}>
              Skip for now
            </Button>
            <Button
              size="large"
              disabled={Object.keys(answers).length !== questions.length}
              onClick={() => setShowResult(true)}
            >
              See my starting spot <ArrowRight size={16} />
            </Button>
          </div>
        </>
      ) : (
        <Card className="placement-result">
          <span className="placement-result-icon">
            {score >= 4 ? "🚀" : score >= 2 ? "🌸" : "🐣"}
          </span>
          <span className="eyebrow">YOUR STARTING SPOT</span>
          <h2>{score}/5 feels like a great start.</h2>
          <p>
            {skipCount
              ? `We’ll mark the first ${skipCount} grammar ${skipCount === 1 ? "lesson" : "lessons"} as familiar. You can revisit any time.`
              : "We’ll start with the first lessons and build a comfy foundation together."}
          </p>
          <Button size="large" onClick={finish}>
            Head to my nest <Sparkles size={17} />
          </Button>
        </Card>
      )}
    </main>
  );
}
