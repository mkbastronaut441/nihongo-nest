import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Deliberately returns only opt-in nicknames and XP, never account identifiers. */
export async function GET() {
  const rows = await prisma.profile.findMany({
    where: { leaderboardOptIn: true, publicNickname: { not: null } },
    select: { publicNickname: true, user: { select: { stats: { select: { xp: true } } } } },
    take: 100,
  });
  return NextResponse.json(
    {
      entries: rows
        .map((row) => ({ nickname: row.publicNickname, xp: row.user.stats?.xp ?? 0 }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 20),
    },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
