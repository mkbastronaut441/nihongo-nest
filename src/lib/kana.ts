import kanaContent from "../../content/kana/kana.json";

export type KanaEntry = (typeof kanaContent.entries)[number];
export const kanaEntries = kanaContent.entries as KanaEntry[];
export function speakKana(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
  return true;
}
