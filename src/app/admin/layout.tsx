import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/nav/logout-button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { SPORTS, SPORT_LABELS, SPORT_SLUGS } from "@/lib/sports";

const TOP_LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/atleticas", label: "Atléticas" },
  { href: "/admin/locais", label: "Locais" },
  { href: "/admin/comunidade", label: "Comunidade" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // SUMULA só acessa /admin/sumula — o resto do menu (times, sorteio, atléticas...)
  // não serve pra ela, então mostra um wrapper mínimo em vez do painel completo.
  const isSumula = session?.role === "SUMULA";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <aside className="steel-border shrink-0 rounded-sm bg-surface p-4 lg:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {isSumula ? "Súmula" : "Diretoria"}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gold">{session?.name}</p>

        {!isSumula && (
          <>
            <nav className="mt-4 flex flex-col gap-1 text-sm">
              {TOP_LINKS.map((link) => (
                <AdminNavLink key={link.href} href={link.href}>
                  {link.label}
                </AdminNavLink>
              ))}
              {(session?.role === "ADMIN" || session?.role === "MASTER") && (
                <AdminNavLink href="/admin/usuarios">Usuários</AdminNavLink>
              )}
              {session?.role === "MASTER" && (
                <AdminNavLink href="/admin/auditoria">Auditoria</AdminNavLink>
              )}
            </nav>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Modalidades
            </p>
            <nav className="mt-1 flex flex-col gap-1 text-sm">
              {SPORTS.map((sport) => (
                <AdminNavLink
                  key={sport}
                  href={`/admin/${SPORT_SLUGS[sport]}/times`}
                  activePrefix={`/admin/${SPORT_SLUGS[sport]}`}
                >
                  {SPORT_LABELS[sport]}
                </AdminNavLink>
              ))}
            </nav>
          </>
        )}

        <div className="mt-6">
          <LogoutButton className="min-h-[40px] w-full rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
