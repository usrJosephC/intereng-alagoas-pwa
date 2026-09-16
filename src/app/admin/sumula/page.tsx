import { prisma } from "@/lib/prisma";
import { SumulaMatches } from "@/components/admin/sumula-matches";

export const metadata = { title: "Súmula" };

export default async function AdminSumulaPage() {
  const matches = await prisma.match.findMany({
    orderBy: { matchDate: "asc" },
    include: {
      teamA: { include: { atletica: { select: { name: true } } } },
      teamB: { include: { atletica: { select: { name: true } } } },
      venue: { select: { name: true } },
    },
  });

  const matchesData = matches.map((m) => ({ ...m, matchDate: m.matchDate.toISOString() }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Súmula
      </h1>
      <p className="mt-1 text-sm text-muted">
        Atualize placar, status e observações do jogo. Times, local, data e fase só a diretoria
        edita.
      </p>
      <div className="mt-6">
        <SumulaMatches initialMatches={matchesData} />
      </div>
    </div>
  );
}
