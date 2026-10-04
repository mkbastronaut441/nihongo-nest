# Adding lesson content

Lessons are JSON so an editor can add and revise content without touching React. The current ten beginner grammar lessons live in [`lessons/grammar-n5.json`](lessons/grammar-n5.json). Each lesson has a stable `id`, a `title`, learner-facing `summary` and `concept`, and an ordered `steps` array.

## Lesson shape

```json
{
  "id": "g11-time-words",
  "title": "Talk about when",
  "summary": "Use a time word to tell when something happens.",
  "concept": "[Time] に [action].",
  "steps": [
    {
      "type": "intro",
      "title": "A time on the clock",
      "body": "Put に after a specific time.",
      "japanese": "七時に起きます。",
      "reading": "Shichi-ji ni okimasu.",
      "meaning": "I get up at seven."
    },
    {
      "type": "multiple-choice",
      "prompt": "Which particle marks the time?",
      "options": ["に", "を", "で"],
      "answer": "に",
      "feedback": "That’s it. に pins down a time."
    }
  ]
}
```

## Supported step types

- `intro`: `title`, `body`, and optional `japanese`, `reading`, and `meaning`.
- `multiple-choice`: `prompt`, `options`, `answer`, optional `feedback`.
- `listen-pick`: `prompt`, `audio`, `options`, `answer`, optional `feedback`. The browser speech voice reads `audio` in Japanese.
- `match-pairs`: `prompt`, `pairs` with `left` and `right`, optional `feedback`.
- `type-answer`: `prompt`, `answers` (accepted spellings), optional `hint` and `feedback`.
- `sentence-builder`: `prompt`, `tokens`, `answer`, and optional `translation`. Learners can tap tokens or drag them into order.
- `tracing`: `prompt`, one `character`, and SVG path strings in `strokes`.

Keep Japanese beginner friendly, provide a short English meaning when it helps, and use feedback that makes the next try feel welcome. Add unique lesson IDs and make the answer match the exact sentence assembled by the tokens.

The player’s TypeScript shapes live in `src/lib/phase3-content.ts`, while rendering and answer checking live in `src/components/lesson-player.tsx`. Add a new step renderer there if you introduce a new step type.

## Content files and data generation

- Kana catalog: `kana/kana.json`.
- Vocabulary: `vocabulary/n5.json`.
- Kanji: `kanji/n5.json`.
- Lessons: `lessons/grammar-n5.json`.

The Phase 3 content generator writes the initial vocabulary, kanji, and grammar files from project-authored source rows in `scripts/generate-phase3-content.mjs`. Use `npm run content:generate:phase3` to recreate those starter files; it overwrites edits to the generated catalogs. Then run `npm run content:import:kanjivg` to populate ordered kanji stroke paths before seeding. After the JSON is ready, `npm run db:seed:phase3` idempotently copies vocabulary, kanji, unit, and lesson records into the local SQLite database. The lesson player reads lesson JSON directly, so lesson edits do not require a database reseed.

All bundled vocabulary, sentence examples, grammar explanations, readings, and memory stories are written for this project. Kanji stroke paths are from KanjiVG by Ulrich Apel, licensed CC BY-SA 3.0; see `/licenses` for attribution. No Tatoeba or KANJIDIC data is included. For any future open-licensed import, record its exact source, license, and attribution here and on `/licenses` before adding the data.
