import Link from "next/link";
import { clsx } from "clsx";
import type { Category } from "@prisma/client";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/sports";

/** Abas Masculino/Feminino via querystring `?categoria=`, reaproveitadas em todas
 * as páginas (admin e públicas) que escopam times/grupos/jogos por categoria. */
export function CategoryTabs({ basePath, active }: { basePath: string; active: Category }) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((category) => (
        <Link
          key={category}
          href={`${basePath}?categoria=${CATEGORY_SLUGS[category]}`}
          className={clsx(
            "min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
            active === category
              ? "border-gold text-gold"
              : "border-border text-muted hover:text-foreground"
          )}
        >
          {CATEGORY_LABELS[category]}
        </Link>
      ))}
    </div>
  );
}
