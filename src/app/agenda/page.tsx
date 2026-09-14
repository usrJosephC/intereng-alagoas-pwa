import Link from "next/link";
import { clsx } from "clsx";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/agenda/match-card";
import { SPORTS, SPORT_LABELS, SPORT_SLUGS, sportFromSlug } from "@/lib/sports";
import { brazilTodayRangeUTC } from "@/lib/datetime";

export const metadata = { title: "Agenda" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ esporte?: string; quando?: string }>;
}) {
  const params = await searchParams;
  const sportFilter = params.esporte ? sportFromSlug(params.esporte) : null;
  const showAll = params.quando === "todos";

  const { start, end } = brazilTodayRangeUTC();

  const matches = await prisma.match.findMany({
    where: {
      ...(sportFilter ? { sport: sportFilter } : {}),
      ...(showAll ? {} : { matchDate: { gte: start, lt: end } }),
    },
    orderBy: { matchDate: "asc" },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Agenda de jogos
      </h1>
      <p className="mt-1 text-sm text-muted">
        {showAll ? "Todos os jogos cadastrados." : "Jogos de hoje."} Local e horário sujeitos
        a alteração pela diretoria.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterLink label="Todos os esportes" active={!sportFilter} href={buildHref(undefined, showAll)} />
        {SPORTS.map((sport) => (
          <FilterLink
            key={sport}
            label={SPORT_LABELS[sport]}
            active={sportFilter === sport}
            href={buildHref(SPORT_SLUGS[sport], showAll)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <Link
          href={buildHref(params.esporte, false)}
          className={clsx(
            "min-h-[32px] rounded-sm border px-3 py-1 font-semibold uppercase tracking-wide",
            !showAll ? "border-gold text-gold" : "border-border text-muted hover:text-foreground"
          )}
        >
          Hoje
        </Link>
        <Link
          href={buildHref(params.esporte, true)}
          className={clsx(
            "min-h-[32px] rounded-sm border px-3 py-1 font-semibold uppercase tracking-wide",
            showAll ? "border-gold text-gold" : "border-border text-muted hover:text-foreground"
          )}
        >
          Todos
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
        {matches.length === 0 && (
          <p className="steel-border rounded-sm bg-surface p-4 text-sm text-muted">
            Nenhum jogo {showAll ? "cadastrado" : "agendado para hoje"} com esse filtro.
          </p>
        )}
      </div>
    </div>
  );
}

function buildHref(sportSlug: string | undefined, all: boolean) {
  const qs = new URLSearchParams();
  if (sportSlug) qs.set("esporte", sportSlug);
  if (all) qs.set("quando", "todos");
  const query = qs.toString();
  return query ? `/agenda?${query}` : "/agenda";
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        "min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
        active ? "border-gold text-gold" : "border-border text-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
