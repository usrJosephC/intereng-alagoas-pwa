import { notFound } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { sportFromSlug, SPORT_LABELS } from "@/lib/sports";

const TABS = [
  { segment: "times", label: "Times" },
  { segment: "grupos", label: "Grupos" },
  { segment: "jogos", label: "Jogos" },
];

export default async function AdminSportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportFromSlug(slug);
  if (!sport) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        {SPORT_LABELS[sport]}
      </h1>

      <div className="mt-4 flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.segment}
            href={`/admin/${slug}/${tab.segment}`}
            className={clsx(
              "min-h-[40px] border-b-2 border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
