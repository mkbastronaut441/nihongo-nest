import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/kanji/n5.json", import.meta.url);
const content = JSON.parse(await readFile(sourcePath, "utf8"));
const entries = content.entries;
const workers = Array.from({ length: 6 }, async () => {
  while (entries.some((entry) => !entry._strokesReady && !entry._fetching)) {
    const entry = entries.find((item) => !item._strokesReady && !item._fetching);
    if (!entry) return;
    entry._fetching = true;
    const codepoint = entry.character.codePointAt(0).toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codepoint}.svg`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`KanjiVG fetch failed for ${entry.character}: ${response.status} ${url}`);
    const svg = await response.text();
    const strokes = [...svg.matchAll(/<path\b([^>]*?)\/?\s*>/gs)]
      .map(([, attributes]) => {
        const id = attributes.match(/\bid="[^"]*-s(\d+)"/);
        const d = attributes.match(/\bd="([^"]+)"/);
        return id && d ? { order: Number(id[1]), path: d[1] } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
      .map((stroke) => stroke.path);
    if (!strokes.length)
      throw new Error(`No ordered strokes found for ${entry.character} in ${url}`);
    entry.strokes = strokes;
    entry.strokeCount = strokes.length;
    entry._strokesReady = true;
  }
});
await Promise.all(workers);
for (const entry of entries) {
  delete entry._strokesReady;
  delete entry._fetching;
}
content.attribution =
  "KanjiVG stroke path data by Ulrich Apel, used under CC BY-SA 3.0. Other readings, meanings, radicals, and mnemonics are project-authored.";
content.strokeSource = "https://github.com/KanjiVG/kanjivg";
content.strokeLicense = "Creative Commons Attribution-Share Alike 3.0 Unported";
await writeFile(sourcePath, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Imported ordered KanjiVG paths for ${entries.length} kanji.`);
