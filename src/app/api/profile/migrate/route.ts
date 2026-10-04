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
  const preferences = body as { ageMode?: string; goal?: string };
  if (
    !(preferences.ageMode && preferences.ageMode in ageModes) ||
    !(preferences.goal && preferences.goal in goals)
  ) {
    return NextResponse.json({ error: "Invalid age mode or learning goal." }, { status: 400 });
  }

  const ageGroup = ageModes[preferences.ageMode as keyof typeof ageModes];
  const goal = goals[preferences.goal as keyof typeof goals];
  await prisma.profile.upsert({
    where: { userId },
    create: { userId, ageGroup, goal },
    update: { ageGroup, goal },
  });

  return NextResponse.json({ ok: true });
}
