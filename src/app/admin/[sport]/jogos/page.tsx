import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug, categoryFromSlug } from "@/lib/sports";
import { JogosManager } from "@/components/admin/jogos-manager";
import { CategoryTabs } from "@/components/nav/category-tabs";

export const metadata = { title: "Jogos" };

export default async function AdminSportJogosPage({
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

  const [matches, teams, groups, venues] = await Promise.all([
    prisma.match.findMany({
      where: { sport, category },
      orderBy: { matchDate: "asc" },
      include: {
        teamA: { include: { atletica: { select: { name: true } } } },
        teamB: { include: { atletica: { select: { name: true } } } },
        venue: { select: { id: true, name: true } },
      },
    }),
    prisma.team.findMany({
      where: { sport, category },
      include: { atletica: { select: { name: true } } },
    }),
    prisma.group.findMany({ where: { sport, category }, orderBy: { name: "asc" } }),
    prisma.venue.findMany({ orderBy: { name: "asc" } }),
  ]);

  const matchesData = matches.map((m) => ({ ...m, matchDate: m.matchDate.toISOString() }));

  return (
    <div className="space-y-4">
      <CategoryTabs basePath={`/admin/${slug}/jogos`} active={category} />
      <JogosManager
        key={category}
        sport={sport}
        category={category}
        initialMatches={matchesData}
        teams={teams}
        groups={groups}
        venues={venues}
      />
    </div>
  );
}
