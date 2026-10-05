# Nihongo Nest

An inviting Japanese learning home designed around little steps, gentle encouragement and age-aware comfort. Includes kana and kanji practice, 200 self-authored N5 vocabulary cards, ten beginner grammar lessons, spaced repetition, account sync, and gamified progress.

## Requirements

- Node.js 20.9 or later (tested in this project with the workspace’s Node 24 runtime)
- npm 9 or later

## Get started

```bash
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run content:generate:phase3
npm run content:import:kanjivg
npm run db:seed:phase3
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use Node 20.9+ for Next.js and Prisma commands. SQLite is created at `prisma/dev.db`.

To run checks:

```bash
npm run lint
npm test
npm run format:check
npm run build
```

## Sign-in and guest mode

Guest preferences, lessons, SRS cards, XP, daily quest progress, and streaks save in browser local storage. After sign-in, the app merges this guest snapshot into the account and then syncs future changes to SQLite. Email sign-in uses one-time links (and creates an account on first use); Google sign-in is also supported. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, plus `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` or `EMAIL_SERVER`/`EMAIL_FROM`, to enable providers. No sign-in credentials are needed to preview the guest experience.

## Age modes and accessibility

Choose Kids, Teens & young adults, or Adults & seniors during onboarding or change it in Settings. Text size, high contrast, reduced motion, and a dyslexia-friendly system sans-serif option save alongside the chosen age mode. Site identity, mascot, palette references, and primary navigation live in `src/config/site.ts`.

## App routes

| Route                       | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `/`                         | Welcome page                                                 |
| `/onboarding`               | Age mode and learning goal                                   |
| `/signin`                   | Google or email sign-in when configured, with a guest path   |
| `/dashboard`                | XP, level, streak, quests, continue learning and due reviews |
| `/learning-map`             | Unlockable SVG journey from Hokkaido to Okinawa              |
| `/lesson-player`            | Ten interactive beginner grammar lessons                     |
| `/kana-kanji-explorer`      | Hiragana and katakana chart, speech and tracing              |
| `/vocabulary`               | N5 vocabulary flashcards with example sentences and audio    |
| `/kanji`                    | N5 kanji garden with detail pages and writing guides         |
| `/kanji/一`                 | Kanji readings, radical, mnemonic and tracing detail         |
| `/lesson-player`            | Ten interactive beginner grammar lessons                     |
| `/onboarding/placement`     | Optional quick placement check to skip familiar lessons      |
| `/review`                   | Review queue with SM-2 scheduling                            |
| `/games-hub`                | Memory, sound matching and falling kana games                |
| `/reading-library`          | Reading library placeholder                                  |
| `/culture-corner`           | Culture corner placeholder                                   |
| `/profile`                  | Learner stats and achievements links                         |
| `/achievements`             | Badges and collectible milestones                            |
| `/leaderboard`              | Optional community board using privacy-safe nicknames        |
| `/quick-lesson`             | Five-minute daily lesson timer                               |
| `/parent-teacher-dashboard` | Family and classroom placeholder                             |
| `/settings`                 | Age mode, accessibility, sound, mascot and leaderboard       |
| `/licenses`                 | Content and attribution note                                 |

## Folder structure

```text
content/             # Kana, N5 vocab and kanji, grammar lesson JSON
prisma/schema.prisma # SQLite-ready relational schema
scripts/             # Content generation and database seed
public/              # PWA manifest, icon and service worker
src/
  app/                # Next.js App Router pages and auth route
  components/         # Shared navigation, mascot, theme and UI controls
  config/             # Central product identity and palette config
  lib/                # Prisma and NextAuth setup
  store/              # Persisted guest and account learning state
  lib/srs/            # Pure spaced repetition scheduler and tests
```

## Content and licenses

The kana character list, romanization, vocabulary, and lesson copy are project-authored. Kanji stroke paths come from KanjiVG (CC BY-SA 3.0) and are attributed on `/licenses`. Future imported content must be open-licensed and attributed on `/licenses`; contributor notes live in `content/README.md`. Browser speech depends on Japanese voices installed on the device. Guest progress is stored locally and merges into the signed-in account after authentication.
