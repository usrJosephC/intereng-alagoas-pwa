export type StandingsMatch = {
  teamAId: string;
  teamBId: string;
  scoreA: number | null;
  scoreB: number | null;
  status: string;
};

export type StandingsRow = {
  teamId: string;
  jogos: number;
  vitorias: number;
  derrotas: number;
  pontos: number;
  saldo: number;
  marcados: number;
  sofridos: number;
};

/**
 * Classificação calculada on-the-fly a partir dos jogos ENCERRADOS de um grupo.
 * Critério: vitória = 3 pontos, derrota = 0 (sem empate — todo jogo tem vencedor).
 * Desempate: pontos, depois saldo, depois marcados.
 */
export function calcularClassificacao(
  teamIds: string[],
  matches: StandingsMatch[]
): StandingsRow[] {
  const table = new Map<string, StandingsRow>();
  for (const teamId of teamIds) {
    table.set(teamId, {
      teamId,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      pontos: 0,
      saldo: 0,
      marcados: 0,
      sofridos: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== "ENCERRADO" || match.scoreA === null || match.scoreB === null) {
      continue;
    }
    const rowA = table.get(match.teamAId);
    const rowB = table.get(match.teamBId);
    if (!rowA || !rowB) continue;

    rowA.jogos += 1;
    rowB.jogos += 1;
    rowA.marcados += match.scoreA;
    rowA.sofridos += match.scoreB;
    rowB.marcados += match.scoreB;
    rowB.sofridos += match.scoreA;
    rowA.saldo = rowA.marcados - rowA.sofridos;
    rowB.saldo = rowB.marcados - rowB.sofridos;

    if (match.scoreA > match.scoreB) {
      rowA.vitorias += 1;
      rowA.pontos += 3;
      rowB.derrotas += 1;
    } else if (match.scoreB > match.scoreA) {
      rowB.vitorias += 1;
      rowB.pontos += 3;
      rowA.derrotas += 1;
    }
  }

  return [...table.values()].sort(
    (a, b) => b.pontos - a.pontos || b.saldo - a.saldo || b.marcados - a.marcados
  );
}

export type PodioPosicao = { posicao: 1 | 2 | 3 | 4; teamId: string };

/**
 * Pódio final do mata-mata: 1º/2º pelo resultado da FINAL, 3º/4º pela
 * disputa de TERCEIRO lugar. Só entra no pódio quem tem jogo ENCERRADO com
 * placar decidido (sem empate) — enquanto a FINAL/disputa de 3º não acabar,
 * a posição correspondente simplesmente não aparece.
 */
export function calcularPodio(
  playoffMatches: (StandingsMatch & { phase: string })[]
): PodioPosicao[] {
  const resultado: PodioPosicao[] = [];

  function vencedorPerdedor(match: StandingsMatch | undefined): [string, string] | null {
    if (
      !match ||
      match.status !== "ENCERRADO" ||
      match.scoreA === null ||
      match.scoreB === null ||
      match.scoreA === match.scoreB
    ) {
      return null;
    }
    return match.scoreA > match.scoreB
      ? [match.teamAId, match.teamBId]
      : [match.teamBId, match.teamAId];
  }

  const finalMatch = playoffMatches.find((m) => m.phase === "FINAL");
  const terceiroMatch = playoffMatches.find((m) => m.phase === "TERCEIRO");

  const finalResult = vencedorPerdedor(finalMatch);
  if (finalResult) {
    resultado.push({ posicao: 1, teamId: finalResult[0] });
    resultado.push({ posicao: 2, teamId: finalResult[1] });
  }

  const terceiroResult = vencedorPerdedor(terceiroMatch);
  if (terceiroResult) {
    resultado.push({ posicao: 3, teamId: terceiroResult[0] });
    resultado.push({ posicao: 4, teamId: terceiroResult[1] });
  }

  return resultado;
}
