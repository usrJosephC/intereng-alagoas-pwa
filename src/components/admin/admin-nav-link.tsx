"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

/** Link do menu lateral do /admin que se destaca (dourado + sublinhado) quando
 * a página atual está dentro dele. `activePrefix` cobre seções com sub-rotas
 * que não têm página própria (ex: um esporte só tem /times, /grupos e /jogos,
 * "/admin/volei" sozinho não é uma rota) — sem ele, só bate exato no href. */
export function AdminNavLink({
  href,
  activePrefix,
  children,
}: {
  href: string;
  activePrefix?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = activePrefix ? pathname.startsWith(activePrefix) : pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "min-h-[40px] rounded-sm px-2 py-2 font-semibold transition-colors",
        active
          ? "text-gold underline decoration-2 underline-offset-4"
          : "hover:bg-surface-elevated hover:text-gold"
      )}
    >
      {children}
    </Link>
  );
}
