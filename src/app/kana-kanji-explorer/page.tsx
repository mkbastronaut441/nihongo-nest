"use client";

import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import Link from "next/link";
import { Button, Card, Modal } from "@/components/ui";
import { KanaTracer } from "@/components/kana-tracer";
import { kanaEntries, speakKana, type KanaEntry } from "@/lib/kana";
import { useLearning } from "@/store/learning";

type ScriptFilter = "hiragana" | "katakana";
type Category = "all" | "basic" | "dakuten" | "handakuten" | "combination";
export default function KanaExplorerPage() {
  const [script, setScript] = useState<ScriptFilter>("hiragana");
  const [category, setCategory] = useState<Category>("basic");
  const [selected, setSelected] = useState<KanaEntry | null>(null);
  const learned = useLearning((state) => state.learned);
  const addKana = useLearning((state) => state.addKana);
  const entries = useMemo(
    () =>
      kanaEntries.filter(
        (entry) => entry.script === script && (category === "all" || entry.category === category),
      ),
    [script, category],
  );
  return (
    <main id="main-content" className="wrap learning-page">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">KANA GARDEN · {kanaEntries.length} CHARACTERS</span>
          <h1>Meet your kana</h1>
          <p>Tap a character to hear it, explore its shape, and add it to your review nest.</p>
        </div>
        <span className="learning-count">✿ {learned.length} learned</span>
      </div>
      <nav className="phase3-links" aria-label="More Japanese practice">
        <Link href="/vocabulary">
          Word garden <span>200 N5 words</span>
        </Link>
        <Link href="/kanji">
          Kanji garden <span>80 N5 kanji</span>
        </Link>
        <Link href="/lesson-player">
          Grammar lessons <span>10 quick lessons</span>
        </Link>
      </nav>
      <Card className="kana-card">
        <div className="control-row">
          <div className="segmented" aria-label="Choose a script">
            {(["hiragana", "katakana"] as const).map((value) => (
              <button key={value} onClick={() => setScript(value)} aria-pressed={script === value}>
                {value === "hiragana" ? "ひらがな Hiragana" : "カタカナ Katakana"}
              </button>
            ))}
          </div>
          <label className="filter-select">
            Group{" "}
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="basic">Basic</option>
              <option value="dakuten">Dakuten</option>
              <option value="handakuten">Handakuten</option>
              <option value="combination">Combinations</option>
              <option value="all">All groups</option>
            </select>
          </label>
        </div>
        <div className="kana-grid">
          {entries.map((entry) => (
            <button
              className={`kana-tile ${learned.includes(entry.id) ? "is-learned" : ""}`}
              key={entry.id}
              onClick={() => {
                setSelected(entry);
                speakKana(entry.character);
                addKana({
                  kanaId: entry.id,
                  character: entry.character,
                  romaji: entry.romaji,
                  script: entry.script,
                });
              }}
              aria-label={`${entry.character}, ${entry.romaji}${learned.includes(entry.id) ? ", learned" : ""}`}
            >
              <span>{entry.character}</span>
              <small>{entry.romaji}</small>
              {learned.includes(entry.id) && <i aria-label="Learned">✓</i>}
            </button>
          ))}
        </div>
        <p className="kana-help">
          <Volume2 size={16} /> Audio uses your device’s Japanese voice when one is available.
        </p>
      </Card>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.character} · ${selected.romaji}` : "Kana details"}
      >
        {selected && (
          <div className="kana-detail">
            <div className="detail-character">
              <span>{selected.character}</span>
              <small>
                {selected.script} · {selected.category}
              </small>
              <Button variant="secondary" onClick={() => speakKana(selected.character)}>
                <Volume2 size={17} /> Hear it
              </Button>
            </div>
            <p>{selected.detail} This character is now in your review nest.</p>
            <KanaTracer character={selected.character} strokes={selected.strokes} />
          </div>
        )}
      </Modal>
    </main>
  );
}
