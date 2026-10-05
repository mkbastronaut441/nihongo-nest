import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ageModes = { kids: "KIDS", teens: "TEENS", adults: "ADULTS" } as const;
const goals = {
  travel: "TRAVEL",
  anime: "ANIME_MANGA",
  jlpt: "JLPT",
  work: "WORK",
  fun: "FUN",
} as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Sign in to save your preferences." }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });
  const preferences = body as {
    ageMode?: string;
    goal?: string;
    fontScale?: number;
    highContrast?: boolean;
    reducedMotion?: boolean;
    dyslexiaFont?: boolean;
    soundMuted?: boolean;
    leaderboardOptIn?: boolean;
    publicNickname?: string;
    mascotOutfit?: string;
    mascotColor?: string;
  };
  if (
    !(preferences.ageMode && preferences.ageMode in ageModes) ||
    !(preferences.goal && preferences.goal in goals)
  ) {
    return NextResponse.json({ error: "Invalid age mode or learning goal." }, { status: 400 });
  }

  const ageGroup = ageModes[preferences.ageMode as keyof typeof ageModes];
  const goal = goals[preferences.goal as keyof typeof goals];
  const fontScale =
    typeof preferences.fontScale === "number"
      ? Math.min(1.5, Math.max(0.8, preferences.fontScale))
      : 1;
  const settings = {
    ageGroup,
    goal,
    fontScale,
    highContrast: preferences.highContrast === true,
    reducedMotion: preferences.reducedMotion === true,
    dyslexiaFont: preferences.dyslexiaFont === true,
    soundMuted: preferences.soundMuted === true,
    leaderboardOptIn: preferences.leaderboardOptIn === true,
    publicNickname:
      typeof preferences.publicNickname === "string"
        ? preferences.publicNickname.trim().slice(0, 24) || null
        : null,
    mascotOutfit:
      typeof preferences.mascotOutfit === "string"
        ? preferences.mascotOutfit.slice(0, 24)
        : "classic",
    mascotColor:
      typeof preferences.mascotColor === "string" ? preferences.mascotColor.slice(0, 24) : "sakura",
  };
  await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...settings },
    update: settings,
  });

  return NextResponse.json({ ok: true });
}
