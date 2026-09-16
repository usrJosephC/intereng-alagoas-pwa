import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  sportFromSlug,
  categoryFromSlug,
  SPORT_LABELS,
  PHASE_LABELS,
  STATUS_LABELS,
} from "@/lib/sports";
import { calcularClassificacao } from "@/lib/standings";
import { StandingsTable } from "@/components/tabela/standings-table";
import { formatDateTimeBR } from "@/lib/datetime";
import { CategoryTabs } from "@/components/nav/category-tabs";

export default async function TabelaSportPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportFromSlug(slug);
  if (!sport) notFound();
  const category = categoryFromSlug((await searchParams).categoria) ?? "MASCULINO";

  const [groups, playoffMatches] = await Promise.all([
    prisma.group.findMany({
      where: { sport, category },
      orderBy: { name: "asc" },
      include: {
        teams: { include: { team: { include: { atletica: true } } } },
        matches: true,
      },
    }),
    prisma.match.findMany({
      where: { sport, category, phase: { not: "GRUPOS" } },
      orderBy: [{ matchDate: "asc" }],
      include: {
        teamA: { include: { atletica: true } },
        teamB: { include: { atletica: true } },
        venue: true,
      },
    }),
  ]);

  const phaseOrder = ["QUARTAS", "SEMI", "TERCEIRO", "FINAL"];
  const groupedPlayoffs = phaseOrder
    .map((phase) => ({ phase, matches: playoffMatches.filter((m) => m.phase === phase) }))
    .filter((g) => g.matches.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        {SPORT_LABELS[sport]}
      </h1>

      <div className="mt-4">
        <CategoryTabs basePath={`/tabela/${slug}`} active={category} />
      </div>

      {groups.length === 0 && (
        <p className="steel-border mt-6 rounded-sm bg-surface p-4 text-sm text-muted">
          Os grupos ainda não foram sorteados pela diretoria.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {groups.map((group) => {
          const teamIds = group.teams.map((gt) => gt.teamId);
          const teamsById = new Map(
            group.teams.map((gt) => [
              gt.teamId,
              { id: gt.teamId, name: gt.team.atletica.name },
            ])
          );
          const rows = calcularClassificacao(teamIds, group.matches);
          return (
            <div key={group.id} className="steel-border rounded-sm bg-surface p-4">
              <h2 className="font-heading text-base font-semibold uppercase tracking-wide">
                {group.name}
              </h2>
              <div className="mt-3">
                <StandingsTable rows={rows} teamsById={teamsById} />
              </div>
            </div>
          );
        })}
      </div>

      {groupedPlayoffs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-muted">
            Mata-mata
          </h2>
          <div className="mt-4 space-y-6">
            {groupedPlayoffs.map((group) => (
              <div key={group.phase}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gold">
                  {PHASE_LABELS[group.phase]}
                </h3>
                <ul className="mt-2 space-y-2">
                  {group.matches.map((match) => {
                    const hasScore = match.scoreA !== null && match.scoreB !== null;
                    return (
                      <li
                        key={match.id}
                        className="steel-border flex flex-col gap-1 rounded-sm bg-surface p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {match.teamA.atletica.name}
                          </span>
                          <span className="shrink-0 font-heading text-sm font-bold text-gold">
                            {hasScore ? `${match.scoreA} — ${match.scoreB}` : "vs"}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-right text-sm font-semibold">
                            {match.teamB.atletica.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{formatDateTimeBR(match.matchDate)}</span>
                          <span>{STATUS_LABELS[match.status]}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
