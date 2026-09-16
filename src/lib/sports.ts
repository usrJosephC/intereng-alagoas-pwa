import type { Category, Sport } from "@prisma/client";

export const SPORTS: Sport[] = ["VOLEI", "BASQUETE", "FUTSAL", "HANDEBOL"];

export const CATEGORIES: Category[] = ["MASCULINO", "FEMININO"];

export const CATEGORY_LABELS: Record<Category, string> = {
  MASCULINO: "Masculino",
  FEMININO: "Feminino",
};

export const CATEGORY_SLUGS: Record<Category, string> = {
  MASCULINO: "masculino",
  FEMININO: "feminino",
};

export function categoryFromSlug(slug: string | undefined): Category | null {
  const entry = (Object.entries(CATEGORY_SLUGS) as [Category, string][]).find(
    ([, s]) => s === slug
  );
  return entry ? entry[0] : null;
}

export const SPORT_LABELS: Record<Sport, string> = {
  VOLEI: "Vôlei",
  BASQUETE: "Basquete",
  FUTSAL: "Futsal",
  HANDEBOL: "Handebol",
};

export const SPORT_SLUGS: Record<Sport, string> = {
  VOLEI: "volei",
  BASQUETE: "basquete",
  FUTSAL: "futsal",
  HANDEBOL: "handebol",
};

export function sportFromSlug(slug: string): Sport | null {
  const entry = (Object.entries(SPORT_SLUGS) as [Sport, string][]).find(
    ([, s]) => s === slug
  );
  return entry ? entry[0] : null;
}

export const PHASE_LABELS: Record<string, string> = {
  GRUPOS: "Fase de grupos",
  QUARTAS: "Quartas de final",
  SEMI: "Semifinal",
  TERCEIRO: "Disputa de 3º lugar",
  FINAL: "Final",
};

/**
 * Duração estimada de cada jogo (minutos), usada só pra checar choque de horário
 * de uma mesma atlética em jogos diferentes — não é a duração oficial da partida.
 */
export const MATCH_DURATION_MINUTES: Record<Sport, number> = {
  VOLEI: 90,
  BASQUETE: 90,
  FUTSAL: 60,
  HANDEBOL: 60,
};

export const STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  AO_VIVO: "Ao vivo",
  ENCERRADO: "Encerrado",
  ADIADO: "Adiado",
};
