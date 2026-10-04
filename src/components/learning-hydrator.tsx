"use client";

import { useEffect } from "react";
import { useLearning } from "@/store/learning";

export function LearningHydrator() {
  useEffect(() => {
    void useLearning.persist.rehydrate();
  }, []);
  return null;
}
