import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { entries } = JSON.parse(
  await readFile(new URL("../content/kana/kana.json", import.meta.url), "utf8"),
);
try {
  for (const entry of entries) {
    const quote = (value) => (value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`);
    const sql = `INSERT INTO "Kana" ("id", "character", "romanization", "script", "category", "row", "detail", "strokes") VALUES (${quote(entry.id)}, ${quote(entry.character)}, ${quote(entry.romaji)}, ${quote(entry.script)}, ${quote(entry.category)}, ${quote(entry.row || null)}, ${quote(entry.detail)}, ${quote(JSON.stringify(entry.strokes))}) ON CONFLICT("character") DO UPDATE SET "romanization"=excluded."romanization", "script"=excluded."script", "category"=excluded."category", "row"=excluded."row", "detail"=excluded."detail", "strokes"=excluded."strokes"`;
    await prisma.$executeRawUnsafe(sql);
  }
  console.log(`Seeded ${entries.length} kana records.`);
} finally {
  await prisma.$disconnect();
}
