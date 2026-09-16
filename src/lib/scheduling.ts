import { prisma } from "@/lib/prisma";
import { MATCH_DURATION_MINUTES } from "@/lib/sports";
import type { Sport } from "@prisma/client";

export type ScheduleConflict = {
  matchId: string;
  atleticaName: string;
  sport: Sport;
  opponentName: string;
  matchDate: Date;
};

/**
 * Verifica se alguma das atléticas dos dois times já tem outro jogo (qualquer
 * esporte/categoria) num horário que se sobrepõe ao candidato — o pedido é pra
 * evitar, por ex., a mesma atlética jogando vôlei e handebol no mesmo horário.
 * Janela de ocupação = duração estimada do esporte (MATCH_DURATION_MINUTES),
 * já que o app não rastreia a duração real de cada partida.
 */
export async function checarChoqueHorario(params: {
  teamAId: string;
  teamBId: string;
  sport: Sport;
  matchDate: Date;
  excludeMatchId?: string;
}): Promise<ScheduleConflict[]> {
  const { teamAId, teamBId, sport, matchDate, excludeMatchId } = params;

  const teams = await prisma.team.findMany({
    where: { id: { in: [teamAId, teamBId] } },
    select: { atleticaId: true },
  });
  const atleticaIds = [...new Set(teams.map((t) => t.atleticaId))];
  if (atleticaIds.length === 0) return [];

  const candidateStart = matchDate.getTime();
  const candidateEnd = candidateStart + MATCH_DURATION_MINUTES[sport] * 60 * 1000;
  // Busca numa janela ampla (±4h); o filtro fino de sobreposição é feito abaixo,
  // já que a duração varia por esporte.
  const searchStart = new Date(candidateStart - 4 * 60 * 60 * 1000);
  const searchEnd = new Date(candidateEnd + 4 * 60 * 60 * 1000);

  const otherMatches = await prisma.match.findMany({
    where: {
      ...(excludeMatchId ? { id: { not: excludeMatchId } } : {}),
      matchDate: { gte: searchStart, lte: searchEnd },
      OR: [
        { teamA: { atleticaId: { in: atleticaIds } } },
        { teamB: { atleticaId: { in: atleticaIds } } },
      ],
    },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
    },
  });

  const conflicts: ScheduleConflict[] = [];
  for (const match of otherMatches) {
    const otherStart = match.matchDate.getTime();
    const otherEnd = otherStart + MATCH_DURATION_MINUTES[match.sport] * 60 * 1000;
    const overlaps = candidateStart < otherEnd && otherStart < candidateEnd;
    if (!overlaps) continue;

    if (atleticaIds.includes(match.teamA.atleticaId)) {
      conflicts.push({
        matchId: match.id,
        atleticaName: match.teamA.atletica.name,
        sport: match.sport,
        opponentName: match.teamB.atletica.name,
        matchDate: match.matchDate,
      });
    }
    if (atleticaIds.includes(match.teamB.atleticaId)) {
      conflicts.push({
        matchId: match.id,
        atleticaName: match.teamB.atletica.name,
        sport: match.sport,
        opponentName: match.teamA.atletica.name,
        matchDate: match.matchDate,
      });
    }
  }
  return conflicts;
}
