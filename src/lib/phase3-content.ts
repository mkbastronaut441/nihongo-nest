import vocabularyContent from "../../content/vocabulary/n5.json";
import kanjiContent from "../../content/kanji/n5.json";
import grammarContent from "../../content/lessons/grammar-n5.json";

export type VocabularyEntry = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleMeaning: string;
  level: string;
};

export type KanjiEntry = {
  character: string;
  meaning: string;
  onReadings: string[];
  kunReadings: string[];
  radical: string;
  radicalMeaning: string;
  mnemonic: string;
  strokeCount: number;
  jlpt: string;
  strokes: string[];
};

export type GrammarStep = {
  type:
    | "intro"
    | "multiple-choice"
    | "listen-pick"
    | "match-pairs"
    | "type-answer"
    | "sentence-builder"
    | "tracing";
  title?: string;
  body?: string;
  japanese?: string;
  reading?: string;
  meaning?: string;
  prompt?: string;
  options?: string[];
  answer?: string;
  answers?: string[];
  feedback?: string;
  hint?: string;
  audio?: string;
  tokens?: string[];
  translation?: string;
  pairs?: { left: string; right: string }[];
  character?: string;
  strokes?: string[];
};

export type GrammarLesson = {
  id: string;
  title: string;
  summary: string;
  concept: string;
  steps: GrammarStep[];
};

export const vocabulary = vocabularyContent.items as VocabularyEntry[];
export const kanji = kanjiContent.entries as KanjiEntry[];
export const grammarLessons = grammarContent.lessons as GrammarLesson[];
