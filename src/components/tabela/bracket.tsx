import Link from "next/link";
import { clsx } from "clsx";
import { PHASE_LABELS, STATUS_LABELS } from "@/lib/sports";
import { formatDateTimeBR } from "@/lib/datetime";
import { AtleticaLogo } from "@/components/ui/atletica-logo";
import { LiveBadge } from "@/components/ui/live-badge";

type BracketMatch = {
  id: string;
  phase: string;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  matchDate: Date;
  teamA: { atletica: { name: string; logoUrl: string | null } };
  teamB: { atletica: { name: string; logoUrl: string | null } };
};

const MAIN_PHASES = ["QUARTAS", "SEMI", "FINAL"];

/**
 * Chaveamento em colunas (quartas → semi → final). As colunas com menos jogos
 * se espalham na mesma altura das anteriores (flexbox `justify-around` +
 * stretch padrão), o que já dá a leitura visual de bracket sem precisar
 * calcular/desenhar linhas de conexão — o app não guarda qual jogo de uma
 * fase alimenta qual da fase seguinte, então uma linha "certeira" não daria
 * pra desenhar com segurança de qualquer forma.
 */
export function Bracket({ matches }: { matches: BracketMatch[] }) {
  const byPhase = (phase: string) =>
    matches
      .filter((m) => m.phase === phase)
      .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());

  const mainColumns = MAIN_PHASES.map((phase) => ({ phase, matches: byPhase(phase) })).filter(
    (c) => c.matches.length > 0
  );
  const terceiro = byPhase("TERCEIRO");

  if (mainColumns.length === 0 && terceiro.length === 0) return null;

  return (
    <div className="space-y-6">
      {mainColumns.length > 0 && (
        <div className="flex items-stretch gap-6 overflow-x-auto pb-2">
          {mainColumns.map(({ phase, matches: phaseMatches }) => (
            <div key={phase} className="flex w-56 shrink-0 flex-col">
              <h3 className="text-center text-xs font-semibold uppercase tracking-wide text-gold">
                {PHASE_LABELS[phase]}
              </h3>
              <div className="mt-3 flex flex-1 flex-col justify-around gap-4">
                {phaseMatches.map((match) => (
                  <BracketMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {terceiro.length > 0 && (
        <div className="w-56">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {PHASE_LABELS.TERCEIRO}
          </h3>
          <div className="mt-2 space-y-2">
            {terceiro.map((match) => (
              <BracketMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatchCard({ match }: { match: BracketMatch }) {
  const hasScore = match.scoreA !== null && match.scoreB !== null;
  const aWins = hasScore && match.scoreA! > match.scoreB!;
  const bWins = hasScore && match.scoreB! > match.scoreA!;

  return (
    <Link
      href={`/agenda/${match.id}`}
      className="steel-border block rounded-sm bg-surface p-2.5 text-xs transition-colors hover:border-gold"
    >
      <TeamRow
        name={match.teamA.atletica.name}
        logoUrl={match.teamA.atletica.logoUrl}
        score={match.scoreA}
        winner={aWins}
      />
      <TeamRow
        name={match.teamB.atletica.name}
        logoUrl={match.teamB.atletica.logoUrl}
        score={match.scoreB}
        winner={bWins}
      />
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted">
        <span>{formatDateTimeBR(match.matchDate)}</span>
        {match.status === "AO_VIVO" ? (
          <LiveBadge />
        ) : (
          <span>{STATUS_LABELS[match.status]}</span>
        )}
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  logoUrl,
  score,
  winner,
}: {
  name: string;
  logoUrl: string | null;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div className={clsx("flex items-center gap-1.5 py-0.5", winner && "font-bold text-gold")}>
      <AtleticaLogo name={name} logoUrl={logoUrl} className="h-4 w-4" />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      <span>{score ?? "-"}</span>
    </div>
  );
}
