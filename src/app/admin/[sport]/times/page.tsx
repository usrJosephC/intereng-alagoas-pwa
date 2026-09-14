import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sportFromSlug } from "@/lib/sports";
import { TimesManager } from "@/components/admin/times-manager";

export const metadata = { title: "Times" };

export default async function AdminSportTimesPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportFromSlug(slug);
  if (!sport) notFound();

  const [teams, atleticas] = await Promise.all([
    prisma.team.findMany({
      where: { sport },
      orderBy: { createdAt: "asc" },
      include: { atletica: { select: { id: true, name: true } } },
    }),
    prisma.atletica.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return <TimesManager sport={sport} initialTeams={teams} allAtleticas={atleticas} />;
}
