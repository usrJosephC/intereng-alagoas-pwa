import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchCreateSchema } from "@/lib/schemas";
import { SPORTS, CATEGORIES, SPORT_LABELS } from "@/lib/sports";
import { localInputToDate, formatDateTimeBR } from "@/lib/datetime";
import { checarChoqueHorario } from "@/lib/scheduling";
import type { Category, Sport } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sport = body?.sport as Sport | undefined;
  const category = body?.category as Category | undefined;
  const parsed = matchCreateSchema.safeParse(body);
  if (
    !parsed.success ||
    !sport ||
    !SPORTS.includes(sport) ||
    !category ||
    !CATEGORIES.includes(category)
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (parsed.data.teamAId === parsed.data.teamBId) {
    return NextResponse.json({ error: "Os dois times precisam ser diferentes." }, { status: 400 });
  }

  const matchDate = localInputToDate(parsed.data.matchDate);

  if (!parsed.data.forceConflict) {
    const conflicts = await checarChoqueHorario({
      teamAId: parsed.data.teamAId,
      teamBId: parsed.data.teamBId,
      sport,
      matchDate,
    });
    if (conflicts.length > 0) {
      const c = conflicts[0];
      return NextResponse.json(
        {
          error: `Choque de horário: ${c.atleticaName} já tem jogo de ${SPORT_LABELS[c.sport]} vs ${c.opponentName} às ${formatDateTimeBR(c.matchDate)}.`,
          conflict: true,
        },
        { status: 409 }
      );
    }
  }

  const match = await prisma.match.create({
    data: {
      sport,
      category,
      phase: parsed.data.phase,
      groupId: parsed.data.groupId || null,
      teamAId: parsed.data.teamAId,
      teamBId: parsed.data.teamBId,
      venueId: parsed.data.venueId || null,
      matchDate,
    },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}
