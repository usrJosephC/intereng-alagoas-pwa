import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug, categoryFromSlug, SPORT_LABELS } from "@/lib/sports";
import { calcularClassificacao, calcularPodio } from "@/lib/standings";
import { StandingsTable } from "@/components/tabela/standings-table";
import { Bracket } from "@/components/tabela/bracket";
import { PodiumFinal } from "@/components/tabela/podium-final";
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

  const podioResultado = calcularPodio(playoffMatches);
  const podioTeamsById = new Map(
    playoffMatches.flatMap((m) => [
      [m.teamAId, { name: m.teamA.atletica.name, logoUrl: m.teamA.atletica.logoUrl }] as const,
      [m.teamBId, { name: m.teamB.atletica.name, logoUrl: m.teamB.atletica.logoUrl }] as const,
    ])
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        {SPORT_LABELS[sport]}
      </h1>

      <div className="mt-4">
        <CategoryTabs basePath={`/tabela/${slug}`} active={category} />
      </div>

      {podioResultado.length > 0 && (
        <div className="mt-6">
          <PodiumFinal resultado={podioResultado} teamsById={podioTeamsById} />
        </div>
      )}

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
              { id: gt.teamId, name: gt.team.atletica.name, logoUrl: gt.team.atletica.logoUrl },
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

      {playoffMatches.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-muted">
            Mata-mata
          </h2>
          <div className="mt-4">
            <Bracket matches={playoffMatches} />
          </div>
        </div>
      )}
    </div>
  );
}
