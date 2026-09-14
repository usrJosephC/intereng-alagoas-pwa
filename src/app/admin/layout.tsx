import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/nav/logout-button";
import { SPORTS, SPORT_LABELS, SPORT_SLUGS } from "@/lib/sports";

const TOP_LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/atleticas", label: "Atléticas" },
  { href: "/admin/locais", label: "Locais" },
  { href: "/admin/comunidade", label: "Comunidade" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <aside className="steel-border shrink-0 rounded-sm bg-surface p-4 lg:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Diretoria</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gold">{session?.name}</p>

        <nav className="mt-4 flex flex-col gap-1 text-sm">
          {TOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-[40px] rounded-sm px-2 py-2 font-semibold hover:bg-surface-elevated hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
          Modalidades
        </p>
        <nav className="mt-1 flex flex-col gap-1 text-sm">
          {SPORTS.map((sport) => (
            <Link
              key={sport}
              href={`/admin/${SPORT_SLUGS[sport]}/times`}
              className="min-h-[40px] rounded-sm px-2 py-2 font-semibold hover:bg-surface-elevated hover:text-gold"
            >
              {SPORT_LABELS[sport]}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          <LogoutButton className="min-h-[40px] w-full rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
