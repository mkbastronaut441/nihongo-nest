"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { usePreferences } from "@/store/preferences";

export type MascotMood = "happy" | "curious" | "celebrate";

const expressions: Record<MascotMood, { face: string; line: string }> = {
  happy: { face: "🐣", line: "You’re doing lovely!" },
  curious: { face: "🐥", line: "What shall we learn?" },
  celebrate: { face: "🐤", line: "すごい! You did it!" },
};

export function Mascot({
  mood = "happy",
  compact = false,
}: {
  mood?: MascotMood;
  compact?: boolean;
}) {
  const reducedMotion = usePreferences((state) => state.reducedMotion);
  const expression = expressions[mood];
  return (
    <div className={`mascot ${compact ? "mascot--compact" : ""}`}>
      <motion.span
        className="mascot-emoji"
        role="img"
        aria-label={`${siteConfig.mascot.name} the chick, ${mood}`}
        animate={
          reducedMotion
            ? {}
            : mood === "celebrate"
              ? { y: [0, -7, 0], rotate: [0, 7, -7, 0] }
              : { y: [0, -3, 0] }
        }
        transition={
          reducedMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {expression.face}
      </motion.span>
      {!compact && <span className="mascot-bubble">{expression.line}</span>}
    </div>
  );
}
