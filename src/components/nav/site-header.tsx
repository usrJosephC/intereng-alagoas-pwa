import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoMark } from "./logo-mark";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="steel-border sticky top-0 z-40 flex min-h-[56px] items-center justify-between bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <LogoMark className="h-8" />
        <span className="font-heading text-sm font-semibold uppercase tracking-wide text-gradient-gold sm:text-base">
          InterEng Alagoas
        </span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide sm:flex">
        <Link href="/agenda" className="hover:text-gold">
          Agenda
        </Link>
        <Link href="/tabela" className="hover:text-gold">
          Tabela
        </Link>
        <Link href="/comunidade" className="hover:text-gold">
          Comunidade
        </Link>
        {session?.role === "ADMIN" && (
          <Link href="/admin" className="hover:text-gold">
            Diretoria
          </Link>
        )}
      </nav>

      <div className="hidden items-center gap-3 sm:flex">
        {session ? (
          <>
            <span className="text-xs text-muted">{session.name}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="min-h-[40px] rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft"
            >
              Cadastrar
            </Link>
          </>
        )}
      </div>

      {session ? (
        <Link href="/comunidade" className="sm:hidden text-xs font-semibold text-gold">
          {session.name.split(" ")[0]}
        </Link>
      ) : (
        <Link
          href="/login"
          className="sm:hidden min-h-[36px] rounded-sm border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
        >
          Entrar
        </Link>
      )}
    </header>
  );
}
