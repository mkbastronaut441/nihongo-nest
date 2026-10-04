import { mkdir, writeFile } from "node:fs/promises";

const rows = [
  ["", ["あ", "い", "う", "え", "お"], ["a", "i", "u", "e", "o"]],
  ["k", ["か", "き", "く", "け", "こ"], ["ka", "ki", "ku", "ke", "ko"]],
  ["s", ["さ", "し", "す", "せ", "そ"], ["sa", "shi", "su", "se", "so"]],
  ["t", ["た", "ち", "つ", "て", "と"], ["ta", "chi", "tsu", "te", "to"]],
  ["n", ["な", "に", "ぬ", "ね", "の"], ["na", "ni", "nu", "ne", "no"]],
  ["h", ["は", "ひ", "ふ", "へ", "ほ"], ["ha", "hi", "fu", "he", "ho"]],
  ["m", ["ま", "み", "む", "め", "も"], ["ma", "mi", "mu", "me", "mo"]],
  ["y", ["や", null, "ゆ", null, "よ"], ["ya", null, "yu", null, "yo"]],
  ["r", ["ら", "り", "る", "れ", "ろ"], ["ra", "ri", "ru", "re", "ro"]],
  ["w", ["わ", null, null, null, "を"], ["wa", null, null, null, "wo"]],
  ["n", ["ん", null, null, null, null], ["n", null, null, null, null]],
];
const katakanaRows = rows.map(([row, chars, romaji]) => [
  row,
  chars.map((x) => x && String.fromCharCode(x.charCodeAt(0) + 96)),
  romaji,
]);
const dakutenRows = [
  ["g", "がぎぐげご", "ga gi gu ge go"],
  ["z", "ざじずぜぞ", "za ji zu ze zo"],
  ["d", "だぢづでど", "da ji zu de do"],
  ["b", "ばびぶべぼ", "ba bi bu be bo"],
  ["p", "ぱぴぷぺぽ", "pa pi pu pe po"],
];
const comboBase = [
  ["き", ["きゃ", "きゅ", "きょ"], "k"],
  ["ぎ", ["ぎゃ", "ぎゅ", "ぎょ"], "g"],
  ["し", ["しゃ", "しゅ", "しょ"], "sh"],
  ["じ", ["じゃ", "じゅ", "じょ"], "j"],
  ["ち", ["ちゃ", "ちゅ", "ちょ"], "ch"],
  ["ぢ", ["ぢゃ", "ぢゅ", "ぢょ"], "j"],
  ["に", ["にゃ", "にゅ", "にょ"], "ny"],
  ["ひ", ["ひゃ", "ひゅ", "ひょ"], "hy"],
  ["び", ["びゃ", "びゅ", "びょ"], "by"],
  ["ぴ", ["ぴゃ", "ぴゅ", "ぴょ"], "py"],
  ["み", ["みゃ", "みゅ", "みょ"], "my"],
  ["り", ["りゃ", "りゅ", "りょ"], "ry"],
];
const yoon = ["a", "u", "o"];
const rowsToItems = (list, script, category) =>
  list.flatMap(([row, chars, romanizations]) =>
    chars
      .map((character, i) =>
        character
          ? {
              id: `${script}-${character}`,
              character,
              romaji: romanizations[i],
              script,
              category,
              row,
              detail: `${character} is read ${romanizations[i]}.`,
              strokes: genericStroke(character),
            }
          : null,
      )
      .filter(Boolean),
  );
function genericStroke(character) {
  // Self-authored, simple practice guides: three broad brush gestures plus the glyph target.
  // Tracing comparison allows a generous radius, intended for playful familiarization.
  const m = character.codePointAt(0) % 3;
  const variants = [
    ["M30 35 Q50 20 70 35", "M50 30 L50 76", "M30 74 Q50 66 70 74"],
    ["M34 28 L66 28 L66 70 Q50 84 34 70 Z", "M50 24 L50 78"],
    ["M28 34 Q52 22 72 38 Q51 57 30 70", "M50 30 L50 76"],
  ];
  return variants[m];
}
const all = [];
for (const script of ["hiragana", "katakana"]) {
  const baseRows = script === "hiragana" ? rows : katakanaRows;
  all.push(...rowsToItems(baseRows, script, "basic"));
  for (const [row, chars, roma] of dakutenRows) {
    for (const [i, character] of [...chars].entries()) {
      const c =
        script === "hiragana" ? character : String.fromCharCode(character.charCodeAt(0) + 96);
      const romaji = roma.split(" ")[i];
      all.push({
        id: `${script}-${c}`,
        character: c,
        romaji,
        script,
        category: row === "p" ? "handakuten" : "dakuten",
        row,
        detail: `${c} is read ${romaji}.`,
        strokes: genericStroke(c),
      });
    }
  }
  for (const [baseHira, combos, consonant] of comboBase)
    for (let i = 0; i < 3; i++) {
      const hira = combos[i];
      const c = script === "hiragana" ? hira : String.fromCharCode(hira.charCodeAt(0) + 96);
      const base =
        script === "hiragana" ? baseHira : String.fromCharCode(baseHira.charCodeAt(0) + 96);
      all.push({
        id: `${script}-${c}`,
        character: c,
        romaji: `${consonant}${yoon[i]}`,
        script,
        category: "combination",
        row: base,
        detail: `${c} combines ${base} with a small ゃ/ゅ/ょ sound.`,
        strokes: [...genericStroke(base), `M58 60 Q70 54 79 61`],
      });
    }
}
await mkdir("content/kana", { recursive: true });
await writeFile(
  "content/kana/kana.json",
  JSON.stringify(
    {
      attribution:
        "Kana characters and romanization are original educational data; no third-party dataset is included.",
      entries: all,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Wrote ${all.length} kana records`);
