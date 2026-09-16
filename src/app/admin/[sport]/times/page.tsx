import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug, categoryFromSlug } from "@/lib/sports";
import { TimesManager } from "@/components/admin/times-manager";
import { CategoryTabs } from "@/components/nav/category-tabs";

export const metadata = { title: "Times" };

export default async function AdminSportTimesPage({
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

  const [teams, atleticas] = await Promise.all([
    prisma.team.findMany({
      where: { sport, category },
      orderBy: { createdAt: "asc" },
      include: { atletica: { select: { id: true, name: true } } },
    }),
    prisma.atletica.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-4">
      <CategoryTabs basePath={`/admin/${slug}/times`} active={category} />
      <TimesManager
        key={category}
        sport={sport}
        category={category}
        initialTeams={teams}
        allAtleticas={atleticas}
      />
    </div>
  );
}
