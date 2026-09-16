import Link from "next/link";
import { clsx } from "clsx";
import { SPORT_LABELS, PHASE_LABELS, STATUS_LABELS, CATEGORY_LABELS } from "@/lib/sports";
import { formatDateTimeBR } from "@/lib/datetime";

export type MatchCardData = {
  id: string;
  sport: keyof typeof SPORT_LABELS;
  category: keyof typeof CATEGORY_LABELS;
  phase: keyof typeof PHASE_LABELS;
  status: keyof typeof STATUS_LABELS;
  matchDate: Date;
  scoreA: number | null;
  scoreB: number | null;
  teamA: { atletica: { name: string; shortName: string | null } };
  teamB: { atletica: { name: string; shortName: string | null } };
  venue: { name: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  AGENDADO: "text-muted",
  AO_VIVO: "text-danger",
  ENCERRADO: "text-success",
  ADIADO: "text-muted",
};

export function MatchCard({ match }: { match: MatchCardData }) {
  const hasScore = match.scoreA !== null && match.scoreB !== null;

  return (
    <Link
      href={`/agenda/${match.id}`}
      className="steel-border flex flex-col gap-2 rounded-sm bg-surface p-4 transition-colors hover:border-gold"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <span>
          {SPORT_LABELS[match.sport]} {CATEGORY_LABELS[match.category]} · {PHASE_LABELS[match.phase]}
        </span>
        <span className={clsx("font-semibold", STATUS_COLOR[match.status])}>
          {STATUS_LABELS[match.status]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1 truncate font-heading text-sm font-semibold sm:text-base">
          {match.teamA.atletica.shortName ?? match.teamA.atletica.name}
        </span>
        {hasScore ? (
          <span className="font-heading shrink-0 text-lg font-bold text-gold">
            {match.scoreA} — {match.scoreB}
          </span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-muted">vs</span>
        )}
        <span className="min-w-0 flex-1 truncate text-right font-heading text-sm font-semibold sm:text-base">
          {match.teamB.atletica.shortName ?? match.teamB.atletica.name}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{formatDateTimeBR(match.matchDate)}</span>
        <span className="truncate">{match.venue?.name ?? "Local a definir"}</span>
      </div>
    </Link>
  );
}
