import Link from "next/link";
import { kanji } from "@/lib/phase3-content";
import { Card } from "@/components/ui";

export default function KanjiPage() {
  return (
    <main id="main-content" className="wrap learning-page">
      <div className="learning-heading">
        <div>
          <span className="eyebrow">KANJI GARDEN · JLPT N5</span>
          <h1>Meet your first kanji</h1>
          <p>
            Explore 80 beginner kanji with readings, radicals, memory stories, and animated writing
            guides.
          </p>
        </div>
        <span className="learning-count">漢字 · 80</span>
      </div>
      <div className="kanji-grid">
        {kanji.map((item) => (
          <Link href={`/kanji/${encodeURIComponent(item.character)}`} key={item.character}>
            <Card className="kanji-tile">
              <span className="kanji-tile-character">{item.character}</span>
              <strong>{item.meaning}</strong>
              <small>
                {item.onReadings[0]} · {item.strokeCount} strokes
              </small>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
