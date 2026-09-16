import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchUpdateSchema } from "@/lib/schemas";
import { localInputToDate, formatDateTimeBR } from "@/lib/datetime";
import { checarChoqueHorario } from "@/lib/scheduling";
import { SPORT_LABELS } from "@/lib/sports";
import { getSession } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = matchUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { matchDate, venueId, forceConflict, ...rest } = parsed.data;
  const newDate = matchDate !== undefined ? localInputToDate(matchDate) : undefined;

  if (newDate && !forceConflict) {
    const current = await prisma.match.findUnique({
      where: { id },
      select: { sport: true, teamAId: true, teamBId: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    }
    const conflicts = await checarChoqueHorario({
      teamAId: rest.teamAId ?? current.teamAId,
      teamBId: rest.teamBId ?? current.teamBId,
      sport: current.sport,
      matchDate: newDate,
      excludeMatchId: id,
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

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...rest,
      ...(newDate ? { matchDate: newDate } : {}),
      ...(venueId !== undefined ? { venueId: venueId || null } : {}),
    },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return NextResponse.json({ match });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.match.delete({ where: { id } }).catch(() => null);
  const session = await getSession();
  await registrarAuditoria({
    actorId: session?.sub ?? null,
    action: "match.deleted",
    targetType: "Match",
    targetId: id,
  });
  return NextResponse.json({ ok: true });
}
