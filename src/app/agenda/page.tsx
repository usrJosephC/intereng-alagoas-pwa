import Link from "next/link";
import { clsx } from "clsx";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/agenda/match-card";
import {
  SPORTS,
  SPORT_LABELS,
  SPORT_SLUGS,
  sportFromSlug,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  categoryFromSlug,
} from "@/lib/sports";
import { brazilTodayRangeUTC } from "@/lib/datetime";

export const metadata = { title: "Agenda" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ esporte?: string; quando?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const sportFilter = params.esporte ? sportFromSlug(params.esporte) : null;
  const categoryFilter = categoryFromSlug(params.categoria);
  const showAll = params.quando === "todos";

  const { start, end } = brazilTodayRangeUTC();

  const matches = await prisma.match.findMany({
    where: {
      ...(sportFilter ? { sport: sportFilter } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
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
        <FilterLink
          label="Todos os esportes"
          active={!sportFilter}
          href={buildHref(undefined, showAll, params.categoria)}
        />
        {SPORTS.map((sport) => (
          <FilterLink
            key={sport}
            label={SPORT_LABELS[sport]}
            active={sportFilter === sport}
            href={buildHref(SPORT_SLUGS[sport], showAll, params.categoria)}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterLink
          label="Masc. + Fem."
          active={!categoryFilter}
          href={buildHref(params.esporte, showAll, undefined)}
        />
        {CATEGORIES.map((category) => (
          <FilterLink
            key={category}
            label={CATEGORY_LABELS[category]}
            active={categoryFilter === category}
            href={buildHref(params.esporte, showAll, CATEGORY_SLUGS[category])}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <Link
          href={buildHref(params.esporte, false, params.categoria)}
          className={clsx(
            "min-h-[32px] rounded-sm border px-3 py-1 font-semibold uppercase tracking-wide",
            !showAll ? "border-gold text-gold" : "border-border text-muted hover:text-foreground"
          )}
        >
          Hoje
        </Link>
        <Link
          href={buildHref(params.esporte, true, params.categoria)}
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

function buildHref(sportSlug: string | undefined, all: boolean, categorySlug: string | undefined) {
  const qs = new URLSearchParams();
  if (sportSlug) qs.set("esporte", sportSlug);
  if (all) qs.set("quando", "todos");
  if (categorySlug) qs.set("categoria", categorySlug);
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
