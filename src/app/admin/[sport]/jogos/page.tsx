import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug } from "@/lib/sports";
import { JogosManager } from "@/components/admin/jogos-manager";

export const metadata = { title: "Jogos" };

export default async function AdminSportJogosPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportFromSlug(slug);
  if (!sport) notFound();

  const [matches, teams, groups, venues] = await Promise.all([
    prisma.match.findMany({
      where: { sport },
      orderBy: { matchDate: "asc" },
      include: {
        teamA: { include: { atletica: { select: { name: true } } } },
        teamB: { include: { atletica: { select: { name: true } } } },
        venue: { select: { id: true, name: true } },
      },
    }),
    prisma.team.findMany({
      where: { sport },
      include: { atletica: { select: { name: true } } },
    }),
    prisma.group.findMany({ where: { sport }, orderBy: { name: "asc" } }),
    prisma.venue.findMany({ orderBy: { name: "asc" } }),
  ]);

  const matchesData = matches.map((m) => ({ ...m, matchDate: m.matchDate.toISOString() }));

  return (
    <JogosManager
      sport={sport}
      initialMatches={matchesData}
      teams={teams}
      groups={groups}
      venues={venues}
    />
  );
}
