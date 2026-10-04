import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [vocab, kanji, grammar] = await Promise.all([
  load("../content/vocabulary/n5.json"),
  load("../content/kanji/n5.json"),
  load("../content/lessons/grammar-n5.json"),
]);
const quote = (value) => (value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`);
const upsert = async (table, key, columns, values) => {
  const fields = [key, ...columns];
  const sql = `INSERT INTO "${table}" (${fields.map((field) => `"${field}"`).join(",")}) VALUES (${[values[key], ...columns.map((column) => values[column])].map(quote).join(",")}) ON CONFLICT("${key}") DO UPDATE SET ${columns.map((column) => `"${column}"=excluded."${column}"`).join(",")}`;
  await prisma.$executeRawUnsafe(sql);
};
try {
  for (const item of vocab.items)
    await upsert(
      "VocabItem",
      "id",
      ["japanese", "reading", "meaning", "level", "partOfSpeech", "example", "exampleMeaning"],
      {
        id: item.id,
        japanese: item.word,
        reading: item.reading,
        meaning: item.meaning,
        level: item.level,
        partOfSpeech: item.partOfSpeech,
        example: item.example,
        exampleMeaning: item.exampleMeaning,
      },
    );
  for (const item of kanji.entries)
    await upsert(
      "Kanji",
      "character",
      [
        "id",
        "meaning",
        "readings",
        "onReadings",
        "kunReadings",
        "radical",
        "radicalMeaning",
        "mnemonic",
        "jlptLevel",
        "strokeCount",
        "strokes",
      ],
      {
        character: item.character,
        id: `n5-kanji-${item.character.codePointAt(0).toString(16)}`,
        meaning: item.meaning,
        readings: JSON.stringify({ on: item.onReadings, kun: item.kunReadings }),
        onReadings: JSON.stringify(item.onReadings),
        kunReadings: JSON.stringify(item.kunReadings),
        radical: item.radical,
        radicalMeaning: item.radicalMeaning,
        mnemonic: item.mnemonic,
        jlptLevel: item.jlpt,
        strokeCount: item.strokeCount,
        strokes: JSON.stringify(item.strokes),
      },
    );
  await upsert("Unit", "slug", ["id", "title", "description", "order"], {
    slug: "grammar-n5",
    id: "unit-grammar-n5",
    title: "N5 Grammar Garden",
    description: "Ten tiny lessons to help beginner Japanese sentences bloom.",
    order: 1,
  });
  for (const [order, lesson] of grammar.lessons.entries())
    await upsert(
      "Lesson",
      "slug",
      ["id", "title", "description", "contentPath", "order", "unitId", "createdAt", "updatedAt"],
      {
        slug: lesson.id,
        id: `lesson-${lesson.id}`,
        title: lesson.title,
        description: lesson.summary,
        contentPath: "content/lessons/grammar-n5.json",
        order,
        unitId: "unit-grammar-n5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
  console.log(
    `Seeded ${vocab.items.length} vocabulary items, ${kanji.entries.length} kanji and ${grammar.lessons.length} lessons.`,
  );
} finally {
  await prisma.$disconnect();
}
