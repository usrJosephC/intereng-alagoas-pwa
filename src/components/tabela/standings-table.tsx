import type { StandingsRow } from "@/lib/standings";
import { AtleticaLogo } from "@/components/ui/atletica-logo";

type TeamInfo = { id: string; name: string; logoUrl?: string | null };

// Ouro/prata/bronze pro pódio (top 3) — o resto usa o estilo padrão da tabela.
const PODIUM_BADGE: Record<number, string> = {
  1: "bg-gold text-black",
  2: "bg-[#c9ccd6] text-black",
  3: "bg-[#b5651d] text-white",
};

export function StandingsTable({
  rows,
  teamsById,
}: {
  rows: StandingsRow[];
  teamsById: Map<string, TeamInfo>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="py-1.5 pr-2">#</th>
            <th className="py-1.5 pr-2">Atlética</th>
            <th className="px-1.5 py-1.5 text-center">J</th>
            <th className="px-1.5 py-1.5 text-center">V</th>
            <th className="px-1.5 py-1.5 text-center">D</th>
            <th className="px-1.5 py-1.5 text-center">Saldo</th>
            <th className="px-1.5 py-1.5 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const position = index + 1;
            const team = teamsById.get(row.teamId);
            const badgeClass = PODIUM_BADGE[position];
            return (
              <tr key={row.teamId} className="border-t border-border">
                <td className="py-2 pr-2">
                  {badgeClass ? (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}
                    >
                      {position}
                    </span>
                  ) : (
                    <span className="text-muted">{position}º</span>
                  )}
                </td>
                <td className="py-2 pr-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <AtleticaLogo
                      name={team?.name ?? "?"}
                      logoUrl={team?.logoUrl}
                      className="h-6 w-6"
                    />
                    <span className="truncate">{team?.name ?? "—"}</span>
                  </div>
                </td>
                <td className="px-1.5 py-2 text-center">{row.jogos}</td>
                <td className="px-1.5 py-2 text-center">{row.vitorias}</td>
                <td className="px-1.5 py-2 text-center">{row.derrotas}</td>
                <td className="px-1.5 py-2 text-center">{row.saldo}</td>
                <td className="px-1.5 py-2 text-center font-bold text-gold">{row.pontos}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
