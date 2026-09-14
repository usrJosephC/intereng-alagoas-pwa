/**
 * Sorteio de grupos: embaralha os times (Fisher-Yates) e os distribui em N grupos
 * o mais equilibrados possível (round-robin sobre a lista embaralhada).
 */
export function embaralhar<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function distribuirEmGrupos<T>(items: T[], groupCount: number): T[][] {
  if (groupCount < 1) throw new Error("Número de grupos deve ser ao menos 1.");
  const shuffled = embaralhar(items);
  const groups: T[][] = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((item, index) => {
    groups[index % groupCount].push(item);
  });
  return groups;
}

export function nomeDoGrupo(index: number): string {
  return `Grupo ${String.fromCharCode(65 + index)}`;
}

/**
 * Todos os pares únicos (round-robin) de uma lista de ids — cada time joga uma
 * vez contra cada outro time do mesmo grupo. Usado para gerar os jogos da fase
 * de grupos automaticamente.
 */
export function paresRoundRobin<T>(items: T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}
