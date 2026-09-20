import type { PodioPosicao } from "@/lib/standings";
import { AtleticaLogo } from "@/components/ui/atletica-logo";

type TeamInfo = { name: string; logoUrl: string | null };

const BLOCK_STYLE: Record<number, { bg: string; height: string; order: string }> = {
  2: { bg: "bg-[#c9ccd6]", height: "h-20", order: "order-1" },
  1: { bg: "bg-gold", height: "h-28", order: "order-2" },
  3: { bg: "bg-[#b5651d]", height: "h-14", order: "order-3" },
};

/** Pódio final do mata-mata (1º/2º/3º em blocos, estilo pódio olímpico) — só
 * aparece quando a FINAL (e opcionalmente a disputa de 3º) já tiverem
 * resultado, ver `calcularPodio` em src/lib/standings.ts. */
export function PodiumFinal({
  resultado,
  teamsById,
}: {
  resultado: PodioPosicao[];
  teamsById: Map<string, TeamInfo>;
}) {
  if (resultado.length === 0) return null;

  const porPosicao = new Map(resultado.map((r) => [r.posicao, r.teamId]));
  const quartoId = porPosicao.get(4);
  const quarto = quartoId ? teamsById.get(quartoId) : null;

  return (
    <div className="steel-border rounded-sm bg-surface p-6">
      <h2 className="text-center font-heading text-lg font-semibold uppercase tracking-wide text-gradient-gold">
        Pódio final
      </h2>
      <div className="mt-6 flex items-end justify-center gap-4">
        {([2, 1, 3] as const).map((posicao) => {
          const teamId = porPosicao.get(posicao);
          if (!teamId) return null;
          const team = teamsById.get(teamId);
          const style = BLOCK_STYLE[posicao];
          return (
            <div key={posicao} className={`flex w-24 flex-col items-center gap-2 ${style.order}`}>
              <AtleticaLogo name={team?.name ?? "?"} logoUrl={team?.logoUrl} className="h-12 w-12" />
              <p className="max-w-full truncate text-center text-xs font-semibold">
                {team?.name ?? "—"}
              </p>
              <div
                className={`flex w-full items-center justify-center rounded-t-sm font-heading text-2xl font-black text-black ${style.bg} ${style.height}`}
              >
                {posicao}º
              </div>
            </div>
          );
        })}
      </div>
      {quarto && (
        <p className="mt-4 text-center text-xs text-muted">
          4º lugar: <span className="font-semibold text-foreground">{quarto.name}</span>
        </p>
      )}
    </div>
  );
}
