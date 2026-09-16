import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug, categoryFromSlug } from "@/lib/sports";
import { GruposSorteio } from "@/components/admin/grupos-sorteio";
import { CategoryTabs } from "@/components/nav/category-tabs";

export const metadata = { title: "Grupos" };

export default async function AdminSportGruposPage({
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

  const [groups, teamCount] = await Promise.all([
    prisma.group.findMany({
      where: { sport, category },
      orderBy: { name: "asc" },
      include: {
        teams: {
          orderBy: { order: "asc" },
          include: { team: { include: { atletica: { select: { name: true } } } } },
        },
      },
    }),
    prisma.team.count({ where: { sport, category } }),
  ]);

  return (
    <div className="space-y-4">
      <CategoryTabs basePath={`/admin/${slug}/grupos`} active={category} />
      <GruposSorteio
        key={category}
        sport={sport}
        category={category}
        initialGroups={groups}
        teamCount={teamCount}
      />
    </div>
  );
}
