import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchCreateSchema } from "@/lib/schemas";
import { SPORTS } from "@/lib/sports";
import { localInputToDate } from "@/lib/datetime";
import type { Sport } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sport = body?.sport as Sport | undefined;
  const parsed = matchCreateSchema.safeParse(body);
  if (!parsed.success || !sport || !SPORTS.includes(sport)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (parsed.data.teamAId === parsed.data.teamBId) {
    return NextResponse.json({ error: "Os dois times precisam ser diferentes." }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      sport,
      phase: parsed.data.phase,
      groupId: parsed.data.groupId || null,
      teamAId: parsed.data.teamAId,
      teamBId: parsed.data.teamBId,
      venueId: parsed.data.venueId || null,
      matchDate: localInputToDate(parsed.data.matchDate),
    },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}
