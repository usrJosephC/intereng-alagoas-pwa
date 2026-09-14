import type { Sport } from "@prisma/client";

export const SPORTS: Sport[] = ["VOLEI", "BASQUETE", "FUTSAL", "HANDEBOL"];

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

export const STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  AO_VIVO: "Ao vivo",
  ENCERRADO: "Encerrado",
  ADIADO: "Adiado",
};
