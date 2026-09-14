import Link from "next/link";
import { SPORTS, SPORT_LABELS, SPORT_SLUGS } from "@/lib/sports";

export const metadata = { title: "Tabela" };

export default function TabelaIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Tabela de jogos
      </h1>
      <p className="mt-1 text-sm text-muted">Escolha uma modalidade para ver grupos e mata-mata.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPORTS.map((sport) => (
          <Link
            key={sport}
            href={`/tabela/${SPORT_SLUGS[sport]}`}
            className="steel-border flex min-h-[72px] items-center justify-center rounded-sm bg-surface p-4 text-center font-heading text-sm font-semibold uppercase tracking-wide hover:border-gold"
          >
            {SPORT_LABELS[sport]}
          </Link>
        ))}
      </div>
    </div>
  );
}
