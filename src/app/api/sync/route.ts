import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/gamification";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to sync your nest." }, { status: 401 });
  const [stats, streak, progress, cards, profile] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.progress.findMany({
      where: { userId, completed: true, lesson: { isNot: null } },
      select: { completedAt: true, lesson: { select: { slug: true } } },
    }),
    prisma.reviewCard.findMany({ where: { userId, cardKey: { not: null } } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);
  return NextResponse.json({
    xp: stats?.xp ?? 0,
    streak: streak
      ? {
          currentDays: streak.currentDays,
          longestDays: streak.longestDays,
          freezesAvailable: streak.freezesAvailable,
          lastActivityAt: streak.lastActivityAt?.toISOString() ?? null,
        }
      : null,
    completedLessons: progress.flatMap((item) => item.lesson?.slug ?? []),
    lessonCompletions: progress.flatMap((item) =>
      item.lesson?.slug && item.completedAt
        ? [{ id: item.lesson.slug, date: item.completedAt.toISOString() }]
        : [],
    ),
    cards: cards.flatMap((card) => {
      try {
        return [JSON.parse(card.metadata)];
      } catch {
        return [
          {
            id: card.cardKey,
            dueAt: card.dueAt.toISOString(),
            intervalDays: card.interval,
            ease: card.ease,
            repetitions: card.repetitions,
            contentId: card.cardKey,
            kind: "vocabulary",
            front: card.front,
            reading: "",
            meaning: card.back,
          },
        ];
      }
    }),
    profile: profile
      ? {
          ageGroup: profile.ageGroup,
          goal: profile.goal,
          fontScale: profile.fontScale,
          highContrast: profile.highContrast,
          reducedMotion: profile.reducedMotion,
          dyslexiaFont: profile.dyslexiaFont,
          soundMuted: profile.soundMuted,
          leaderboardOptIn: profile.leaderboardOptIn,
          publicNickname: profile.publicNickname,
          mascotOutfit: profile.mascotOutfit,
          mascotColor: profile.mascotColor,
        }
      : null,
  });
}

/** Merge a guest snapshot into the signed-in account. Repeated calls are idempotent. */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to sync your nest." }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid learning data." }, { status: 400 });
  const data = body as {
    xp?: unknown;
    completedLessons?: unknown;
    lessonCompletions?: unknown;
    cards?: unknown;
    activity?: unknown;
    questDate?: unknown;
    questCounts?: unknown;
    completedQuests?: unknown;
    activityDate?: unknown;
  };
  const xp =
    typeof data.xp === "number" && Number.isFinite(data.xp) ? Math.max(0, Math.floor(data.xp)) : 0;
  const completedLessons = Array.isArray(data.completedLessons)
    ? data.completedLessons.filter((id): id is string => typeof id === "string").slice(0, 500)
    : [];
  const lessonCompletions = Array.isArray(data.lessonCompletions)
    ? data.lessonCompletions.filter(
        (entry): entry is { id: string; date: string } =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as { id?: unknown }).id === "string" &&
          typeof (entry as { date?: unknown }).date === "string" &&
          Number.isFinite(Date.parse((entry as { date: string }).date)),
      )
    : [];
  const cards = Array.isArray(data.cards) ? data.cards.slice(0, 2000) : [];
  const counts =
    data.questCounts && typeof data.questCounts === "object"
      ? (data.questCounts as { review?: unknown; lesson?: unknown; minutes?: unknown })
      : {};
  const questDate =
    typeof data.questDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.questDate)
      ? data.questDate
      : new Date().toISOString().slice(0, 10);
  const completeQuests = Array.isArray(data.completedQuests)
    ? data.completedQuests.filter((id): id is string => typeof id === "string")
    : [];
  const activityDate =
    typeof data.activityDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.activityDate)
      ? data.activityDate
      : new Date().toISOString().slice(0, 10);

  await prisma.$transaction(async (tx) => {
    const oldStats = await tx.userStats.findUnique({ where: { userId } });
    const mergedXp = Math.max(oldStats?.xp ?? 0, xp);
    await tx.userStats.upsert({
      where: { userId },
      create: { userId, xp: mergedXp, level: Math.floor(mergedXp / 100) + 1 },
      update: { xp: mergedXp, level: Math.floor(mergedXp / 100) + 1 },
    });

    for (const slug of [...new Set(completedLessons)]) {
      const lesson = await tx.lesson.findUnique({ where: { slug }, select: { id: true } });
      if (lesson)
        await tx.progress.upsert({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
          create: { userId, lessonId: lesson.id, completed: true, completedAt: new Date() },
          update: { completed: true },
        });
    }

    for (const completion of lessonCompletions) {
      const lesson = await tx.lesson.findUnique({
        where: { slug: completion.id },
        select: { id: true },
      });
      if (lesson)
        await tx.progress.upsert({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
          create: {
            userId,
            lessonId: lesson.id,
            completed: true,
            completedAt: new Date(completion.date),
          },
          update: { completed: true, completedAt: new Date(completion.date) },
        });
    }
    const weeklyLessonCount = await tx.progress.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      },
    });

    const questDefinitions = [
      {
        slug: "daily-five",
        title: "Five-minute nest visit",
        description: "Spend five minutes learning",
        target: 5,
        rewardXp: 25,
        count: counts.minutes,
      },
      {
        slug: "daily-review",
        title: "Little review, big growth",
        description: "Review five cards",
        target: 5,
        rewardXp: 20,
        count: counts.review,
      },
      {
        slug: "daily-lesson",
        title: "One step on the path",
        description: "Finish one lesson",
        target: 1,
        rewardXp: 30,
        count: counts.lesson,
      },
      {
        slug: "weekly-lessons",
        title: "A week of little steps",
        description: "Finish three lessons this week",
        target: 3,
        rewardXp: 60,
        count: weeklyLessonCount,
      },
    ];
    for (const definition of questDefinitions) {
      const quest = await tx.quest.upsert({
        where: { slug: definition.slug },
        create: {
          slug: definition.slug,
          title: definition.title,
          description: definition.description,
          target: definition.target,
          rewardXp: definition.rewardXp,
          period: definition.slug.startsWith("weekly") ? "weekly" : "daily",
        },
        update: {
          title: definition.title,
          description: definition.description,
          target: definition.target,
          rewardXp: definition.rewardXp,
        },
      });
      const completedAt =
        completeQuests.includes(definition.slug) ||
        (definition.slug === "weekly-lessons" && weeklyLessonCount >= definition.target)
          ? new Date()
          : null;
      await tx.userQuest.upsert({
        where: { userId_questId: { userId, questId: quest.id } },
        create: {
          userId,
          questId: quest.id,
          progress: Math.min(definition.target, Number(definition.count) || 0),
          assignedAt: new Date(`${questDate}T12:00:00`),
          completedAt,
        },
        update: {
          progress: Math.min(definition.target, Number(definition.count) || 0),
          assignedAt: new Date(`${questDate}T12:00:00`),
          completedAt,
        },
      });
    }

    const badgeDefinitions = [
      {
        slug: "first-steps",
        name: "First Steps",
        description: "Complete your first lesson",
        emoji: "🐾",
        earned: completedLessons.length >= 1,
      },
      {
        slug: "word-garden",
        name: "Word Gardener",
        description: "Grow your review collection to 10 cards",
        emoji: "🌱",
        earned: cards.length >= 10,
      },
      {
        slug: "curious-learner",
        name: "Curious Learner",
        description: "Complete five lessons",
        emoji: "🔎",
        earned: completedLessons.length >= 5,
      },
      {
        slug: "daily-star",
        name: "Daily Star",
        description: "Complete all three daily quests",
        emoji: "⭐",
        earned: completeQuests.filter((slug) => slug.startsWith("daily-")).length >= 3,
      },
      {
        slug: "traveler",
        name: "Little Traveler",
        description: "Finish ten lessons",
        emoji: "🗾",
        earned: completedLessons.length >= 10,
      },
    ];
    for (const definition of badgeDefinitions) {
      const badge = await tx.badge.upsert({
        where: { slug: definition.slug },
        create: {
          slug: definition.slug,
          name: definition.name,
          description: definition.description,
          emoji: definition.emoji,
        },
        update: {},
      });
      if (definition.earned)
        await tx.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
          create: { userId, badgeId: badge.id },
          update: {},
        });
    }

    for (const value of cards) {
      if (!value || typeof value !== "object") continue;
      const card = value as Record<string, unknown>;
      const cardKey = typeof card.id === "string" ? card.id.slice(0, 180) : null;
      if (!cardKey || typeof card.front !== "string" || typeof card.meaning !== "string") continue;
      const dueAt =
        typeof card.dueAt === "string" && Number.isFinite(Date.parse(card.dueAt))
          ? new Date(card.dueAt)
          : new Date();
      const grade =
        typeof card.lastGrade === "number"
          ? Math.max(0, Math.min(3, Math.floor(card.lastGrade)))
          : null;
      await tx.reviewCard.upsert({
        where: { userId_cardKey: { userId, cardKey } },
        create: {
          userId,
          cardKey,
          front: card.front.slice(0, 300),
          back: card.meaning.slice(0, 800),
          metadata: JSON.stringify(card),
          dueAt,
          interval: typeof card.intervalDays === "number" ? Math.max(0, card.intervalDays) : 0,
          ease: typeof card.ease === "number" ? card.ease : 2.5,
          repetitions:
            typeof card.repetitions === "number" ? Math.max(0, Math.floor(card.repetitions)) : 0,
          lastReviewedAt:
            typeof card.lastReviewedAt === "string" &&
            Number.isFinite(Date.parse(card.lastReviewedAt))
              ? new Date(card.lastReviewedAt)
              : null,
          lastGrade: grade,
        },
        update: {
          front: card.front.slice(0, 300),
          back: card.meaning.slice(0, 800),
          metadata: JSON.stringify(card),
          dueAt,
          interval: typeof card.intervalDays === "number" ? Math.max(0, card.intervalDays) : 0,
          ease: typeof card.ease === "number" ? card.ease : 2.5,
          repetitions:
            typeof card.repetitions === "number" ? Math.max(0, Math.floor(card.repetitions)) : 0,
          lastReviewedAt:
            typeof card.lastReviewedAt === "string" &&
            Number.isFinite(Date.parse(card.lastReviewedAt))
              ? new Date(card.lastReviewedAt)
              : null,
          lastGrade: grade,
        },
      });
    }

    if (data.activity === true) {
      const previous = await tx.streak.findUnique({ where: { userId } });
      const next = recordActivity(
        {
          currentDays: previous?.currentDays ?? 0,
          longestDays: previous?.longestDays ?? 0,
          lastActivityAt: previous?.lastActivityAt?.toISOString() ?? null,
          freezesAvailable: previous?.freezesAvailable ?? 1,
          lastFreezeAt: previous?.lastFreezeAt?.toISOString(),
        },
        new Date(`${activityDate}T12:00:00Z`),
      );
      await tx.streak.upsert({
        where: { userId },
        create: { userId, ...next, lastActivityAt: new Date(next.lastActivityAt!) },
        update: {
          currentDays: next.currentDays,
          longestDays: next.longestDays,
          freezesAvailable: next.freezesAvailable,
          lastFreezeAt: next.lastFreezeAt ? new Date(next.lastFreezeAt) : null,
          lastActivityAt: new Date(next.lastActivityAt!),
        },
      });
    }
  });
  return NextResponse.json({ ok: true });
}
