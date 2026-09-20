import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brazilTodayRangeUTC } from "@/lib/datetime";

export const metadata = { title: "Visão geral" };

export default async function AdminHomePage() {
  const { start, end } = brazilTodayRangeUTC();

  const [atleticaCount, teamCount, matchesToday, pendingResults, postCount, userCount] =
    await Promise.all([
      prisma.atletica.count(),
      prisma.team.count(),
      prisma.match.count({ where: { matchDate: { gte: start, lt: end } } }),
      prisma.match.count({ where: { status: { in: ["AGENDADO", "AO_VIVO"] }, matchDate: { lt: end } } }),
      prisma.post.count(),
      prisma.user.count(),
    ]);

  const cards = [
    { label: "Atléticas cadastradas", value: atleticaCount },
    { label: "Inscrições em esportes", value: teamCount },
    { label: "Jogos hoje", value: matchesToday },
    { label: "Jogos sem resultado", value: pendingResults },
    { label: "Posts na comunidade", value: postCount },
    { label: "Usuários cadastrados", value: userCount },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Visão geral
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="steel-border rounded-sm bg-surface p-4">
            <p className="font-heading text-3xl font-bold text-gold">{card.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="steel-border mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-surface p-4">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">
            Agenda completa em Excel
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Todos os jogos (todos os esportes/categorias) numa planilha só — útil pra conferir se
            algum horário se choca.
          </p>
        </div>
        <Link
          href="/api/admin/matches/export"
          className="min-h-[40px] rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft"
        >
          Exportar .xlsx
        </Link>
      </div>
    </div>
  );
}
