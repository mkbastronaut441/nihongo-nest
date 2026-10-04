"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { Mascot } from "@/components/mascot";
import { usePreferences, type AgeMode, type LearningGoal } from "@/store/preferences";

const ages: {
  id: AgeMode;
  title: string;
  age?: string;
  description: string;
  emoji: string;
  color: string;
}[] = [
  {
    id: "kids",
    title: "Kids",
    age: "6–12 years",
    description: "Colorful, cheerful & full of stories",
    emoji: "🧸",
    color: "pink",
  },
  {
    id: "teens",
    title: "Teens & young adults",
    description: "Fast, fun & full of things you love",
    emoji: "🎧",
    color: "purple",
  },
  {
    id: "adults",
    title: "Adults & seniors",
    description: "Clear, comfy & just your pace",
    emoji: "🍵",
    color: "green",
  },
];

const goals: { id: LearningGoal; title: string; emoji: string; description: string }[] = [
  { id: "travel", title: "Travel", emoji: "✈️", description: "Find your way around" },
  { id: "anime", title: "Anime & manga", emoji: "🎏", description: "The stories you love" },
  { id: "jlpt", title: "JLPT", emoji: "📖", description: "Work toward a level" },
  { id: "work", title: "Work", emoji: "💼", description: "Use Japanese on the job" },
  { id: "fun", title: "Just for fun", emoji: "🌸", description: "Follow your curiosity" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const saved = usePreferences();
  const [step, setStep] = useState(0);
  const [ageMode, setAgeMode] = useState<AgeMode>(saved.ageMode);
  const [goal, setGoal] = useState<LearningGoal>(saved.goal ?? "fun");
  const finish = () => {
    saved.setProfile(ageMode, goal);
    router.push("/onboarding/placement");
  };

  return (
    <main id="main-content" className="onboarding-page">
      <section className="onboarding-card">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} /> Back home
        </Link>
        <div className="onboarding-progress" aria-label={`Step ${step + 1} of 2`}>
          <span className={step === 0 ? "is-current" : "is-done"} />
          <span className={step === 1 ? "is-current" : ""} />
        </div>
        <div className="onboarding-mascot">
          <Mascot mood={step === 0 ? "curious" : "happy"} compact />
        </div>
        {step === 0 ? (
          <>
            <span className="eyebrow">A space that feels like yours</span>
            <h1>First, who’s joining us?</h1>
            <p className="onboarding-lead">Pick a style you like. You can change it any time.</p>
            <div className="choice-stack">
              {ages.map((age) => (
                <button
                  key={age.id}
                  type="button"
                  onClick={() => setAgeMode(age.id)}
                  className={`age-choice age-choice--${age.color} ${ageMode === age.id ? "is-selected" : ""}`}
                  aria-pressed={ageMode === age.id}
                >
                  <span className="age-emoji">{age.emoji}</span>
                  <span className="age-copy">
                    <strong>{age.title}</strong>
                    <small>
                      {age.age ? `${age.age} · ` : ""}
                      {age.description}
                    </small>
                  </span>
                  <span className="choice-check">{ageMode === age.id && <Check size={16} />}</span>
                </button>
              ))}
            </div>
            <Button className="onboarding-next" size="large" onClick={() => setStep(1)}>
              Next, pick a goal <ArrowRight size={18} />
            </Button>
          </>
        ) : (
          <>
            <span className="eyebrow">Tell Mochi what sounds fun</span>
            <h1>What brings you here?</h1>
            <p className="onboarding-lead">
              We’ll use this to make your nest feel a little more you.
            </p>
            <div className="goal-grid">
              {goals.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id)}
                  className={`goal-choice ${goal === item.id ? "is-selected" : ""}`}
                  aria-pressed={goal === item.id}
                >
                  <span>{item.emoji}</span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <Button variant="quiet" size="large" onClick={() => setStep(0)}>
                <ArrowLeft size={18} /> Back
              </Button>
              <Button size="large" onClick={finish}>
                Make my nest <Sparkles size={17} />
              </Button>
            </div>
          </>
        )}
        <p className="privacy-note">
          <Heart size={13} /> No wrong answers here. Just your own way to learn.
        </p>
      </section>
    </main>
  );
}
