"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const TABS = [
  { href: "/", label: "Início" },
  { href: "/agenda", label: "Agenda" },
  { href: "/tabela", label: "Tabela" },
  { href: "/comunidade", label: "Comunidade" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="steel-border fixed inset-x-0 bottom-0 z-40 flex min-h-[64px] items-stretch bg-surface sm:hidden">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide",
              active ? "text-gold" : "text-muted"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
