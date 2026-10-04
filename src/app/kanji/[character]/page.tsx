import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { KanaTracer } from "@/components/kana-tracer";
import { kanji } from "@/lib/phase3-content";

export function generateStaticParams() {
  return kanji.map((entry) => ({ character: entry.character }));
}
export default async function KanjiDetailPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const { character } = await params;
  const entry = kanji.find((item) => item.character === decodeURIComponent(character));
  if (!entry) notFound();
  return (
    <main id="main-content" className="wrap learning-page">
      <Link href="/kanji" className="back-link">
        <ArrowLeft size={16} /> N5 kanji garden
      </Link>
      <div className="kanji-detail-grid">
        <Card className="kanji-detail-card">
          <div className="kanji-detail-head">
            <span className="kanji-detail-character">{entry.character}</span>
            <div>
              <span className="eyebrow">
                JLPT {entry.jlpt} · {entry.strokeCount} STROKES
              </span>
              <h1>{entry.meaning}</h1>
              <span className="kanji-radical">
                Radical: {entry.radical} · {entry.radicalMeaning}
              </span>
            </div>
          </div>
          <div className="reading-columns">
            <section>
              <h2>On’yomi</h2>
              <p>{entry.onReadings.length ? entry.onReadings.join(" · ") : "—"}</p>
            </section>
            <section>
              <h2>Kun’yomi</h2>
              <p>{entry.kunReadings.length ? entry.kunReadings.join(" · ") : "—"}</p>
            </section>
          </div>
          <section className="mnemonic-box">
            <Sparkles size={19} />
            <div>
              <strong>A little memory story</strong>
              <p>{entry.mnemonic}</p>
            </div>
          </section>
          <h2 className="trace-title">Watch and trace</h2>
          <p className="trace-copy">
            Follow the animated guide, then draw the shape. A little wobble is okay.
          </p>
          <KanaTracer character={entry.character} strokes={entry.strokes} viewBoxSize={109} />
          <Link className="button button--secondary" href="/kanji">
            Back to kanji garden
          </Link>
        </Card>
      </div>
    </main>
  );
}
