import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug } from "@/lib/sports";
import { GruposSorteio } from "@/components/admin/grupos-sorteio";

export const metadata = { title: "Grupos" };

export default async function AdminSportGruposPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportFromSlug(slug);
  if (!sport) notFound();

  const [groups, teamCount] = await Promise.all([
    prisma.group.findMany({
      where: { sport },
      orderBy: { name: "asc" },
      include: {
        teams: {
          orderBy: { order: "asc" },
          include: { team: { include: { atletica: { select: { name: true } } } } },
        },
      },
    }),
    prisma.team.count({ where: { sport } }),
  ]);

  return <GruposSorteio sport={sport} initialGroups={groups} teamCount={teamCount} />;
}
