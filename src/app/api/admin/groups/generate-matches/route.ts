import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SPORTS, CATEGORIES } from "@/lib/sports";
import { paresRoundRobin } from "@/lib/sorteio";
import type { Category, Sport } from "@prisma/client";

/**
 * Gera automaticamente os jogos da fase de grupos (todos os pares round-robin
 * dentro de cada grupo já sorteado). Idempotente: pares que já têm um jogo
 * cadastrado (nos dois sentidos) são pulados, então pode rodar de novo depois
 * de sortear/inscrever mais times sem duplicar jogos existentes. `matchDate`
 * sai com um valor provisório (agora) — a diretoria só precisa ajustar
 * ginásio e horário depois, não recadastrar o confronto inteiro.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sport = body?.sport as Sport | undefined;
  const category = body?.category as Category | undefined;
  if (!sport || !SPORTS.includes(sport) || !category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Esporte/categoria inválido." }, { status: 400 });
  }

  const groups = await prisma.group.findMany({
    where: { sport, category },
    orderBy: { name: "asc" },
    include: { teams: { orderBy: { order: "asc" }, select: { teamId: true } } },
  });

  if (groups.length === 0) {
    return NextResponse.json(
      { error: "Sorteie os grupos antes de gerar os jogos." },
      { status: 400 }
    );
  }

  const existingMatches = await prisma.match.findMany({
    where: { sport, category, phase: "GRUPOS", groupId: { in: groups.map((g) => g.id) } },
    select: { groupId: true, teamAId: true, teamBId: true },
  });
  const existingPairs = new Set(
    existingMatches.map((m) => `${m.groupId}:${[m.teamAId, m.teamBId].sort().join("-")}`)
  );

  const toCreate: { groupId: string; teamAId: string; teamBId: string }[] = [];
  for (const group of groups) {
    const teamIds = group.teams.map((gt) => gt.teamId);
    for (const [teamAId, teamBId] of paresRoundRobin(teamIds)) {
      const key = `${group.id}:${[teamAId, teamBId].sort().join("-")}`;
      if (!existingPairs.has(key)) {
        toCreate.push({ groupId: group.id, teamAId, teamBId });
      }
    }
  }

  if (toCreate.length === 0) {
    return NextResponse.json({ matches: [], created: 0, skipped: existingMatches.length });
  }

  const now = new Date();
  const matches = await prisma.$transaction(
    toCreate.map((pair) =>
      prisma.match.create({
        data: {
          sport,
          category,
          phase: "GRUPOS",
          groupId: pair.groupId,
          teamAId: pair.teamAId,
          teamBId: pair.teamBId,
          matchDate: now,
        },
        include: {
          teamA: { include: { atletica: true } },
          teamB: { include: { atletica: true } },
          venue: true,
        },
      })
    )
  );

  return NextResponse.json({ matches, created: matches.length, skipped: existingMatches.length });
}
