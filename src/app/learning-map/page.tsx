"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLearning } from "@/store/learning";
import { usePreferences } from "@/store/preferences";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/mascot";

const regions = [
  "Hokkaido",
  "Tohoku",
  "Kanto",
  "Chubu",
  "Kansai",
  "Chugoku",
  "Shikoku",
  "Kyushu",
  "Okinawa",
];
const points = [
  [204, 54],
  [180, 117],
  [196, 192],
  [160, 265],
  [205, 337],
  [145, 407],
  [220, 465],
  [155, 528],
  [230, 601],
];

export default function LearningMapPage() {
  const completed = useLearning((state) => state.completedLessons);
  const reducedMotion = usePreferences((state) => state.reducedMotion);
  const unlocked = Math.min(regions.length, Math.max(1, completed.length + 1));
  return (
    <main id="main-content" className="interior-page wrap journey-page">
      <header className="journey-heading">
        <span className="eyebrow">YOUR LEARNING MAP</span>
        <h1>A little journey through Japan</h1>
        <p>Every lesson lights the next stop, from snowy Hokkaido to sunny Okinawa.</p>
        <Mascot mood="curious" compact />
      </header>
      <Card className="journey-card">
        <div
          className="journey-art"
          role="img"
          aria-label="Learning journey down Japan, from Hokkaido to Okinawa"
        >
          <svg viewBox="0 0 420 660" className="japan-journey" aria-hidden="true">
            <path
              d="M241 26c34 18 47 43 30 68l-29 35 13 43-20 34 13 39-38 36 26 31-12 39 24 25-22 37 21 37-23 37 19 39-27 40 23 36-28 51-37 9 8-47-22-31 24-41-22-32 22-42-29-26 23-43-14-30 29-46-22-36 34-32-16-40 29-45-11-36 32-46-11-31z"
              fill="var(--journey-land)"
              stroke="var(--journey-line)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d={points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ")}
              fill="none"
              stroke="var(--journey-path)"
              strokeWidth="5"
              strokeDasharray="8 10"
              strokeLinecap="round"
            />
            {points.map(([x, y], i) => (
              <g key={regions[i]} transform={`translate(${x} ${y})`}>
                {i < unlocked && (
                  <motion.circle
                    r="20"
                    fill="var(--journey-glow)"
                    initial={reducedMotion ? false : { scale: 0.6, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 0.72 }}
                    transition={{ duration: reducedMotion ? 0 : 0.4 }}
                  />
                )}
                <circle
                  r="13"
                  fill={i < unlocked ? "var(--journey-open)" : "var(--journey-closed)"}
                  stroke="white"
                  strokeWidth="4"
                />
                <text
                  x={i % 2 === 0 ? 24 : -24}
                  y="5"
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  className="journey-label"
                >
                  {regions[i]}
                  {i < unlocked ? "" : " · soon"}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="journey-stops">
          <p>
            <strong>
              {unlocked} of {regions.length}
            </strong>{" "}
            regions open · {completed.length} {completed.length === 1 ? "lesson" : "lessons"}{" "}
            complete
          </p>
          <Link className="button button--primary" href="/lesson-player?lesson=g01-desu">
            Continue your journey →
          </Link>
        </div>
      </Card>
    </main>
  );
}
