"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { usePreferences } from "@/store/preferences";
import { useLearning } from "@/store/learning";

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
  const outfit = usePreferences((state) => state.mascotOutfit);
  const color = usePreferences((state) => state.mascotColor);
  const xp = useLearning((state) => state.xp);
  const accessory =
    outfit === "traveler" && xp >= 250 ? "🎒" : outfit === "sakura" && xp >= 100 ? "🌸" : "";
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
        {accessory && <span aria-hidden="true">{accessory}</span>}
      </motion.span>
      <span
        className="mascot-color-chip"
        style={{
          backgroundColor:
            color === "indigo" ? "#35376f" : color === "matcha" ? "#769477" : "#e998ad",
        }}
        aria-label={`${color} mascot color`}
      />
      {!compact && <span className="mascot-bubble">{expression.line}</span>}
    </div>
  );
}
