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

/**
 * Igual a `distribuirEmGrupos`, mas com cabeças de chave fixos: cada `seed`
 * ocupa a posição 0 (cabeça) do seu grupo antes do resto ser embaralhado e
 * distribuído. O restante vai sempre pro grupo com menos times no momento
 * (em vez de round-robin puro por índice) — assim os grupos ficam
 * equilibrados mesmo com 1-2 posições já preenchidas pelos cabeças.
 */
export function distribuirEmGruposComCabecas<T>(
  items: T[],
  groupCount: number,
  seeds: { groupIndex: number; item: T }[]
): T[][] {
  if (groupCount < 1) throw new Error("Número de grupos deve ser ao menos 1.");
  const groups: T[][] = Array.from({ length: groupCount }, () => []);

  const seededItems = new Set(seeds.map((s) => s.item));
  for (const seed of seeds) {
    if (seed.groupIndex < 0 || seed.groupIndex >= groupCount) {
      throw new Error("Grupo do cabeça de chave inválido.");
    }
    groups[seed.groupIndex].push(seed.item);
  }

  const rest = embaralhar(items.filter((item) => !seededItems.has(item)));
  for (const item of rest) {
    let smallest = 0;
    for (let i = 1; i < groupCount; i++) {
      if (groups[i].length < groups[smallest].length) smallest = i;
    }
    groups[smallest].push(item);
  }

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
