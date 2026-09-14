import type { StandingsRow } from "@/lib/standings";

type TeamInfo = { id: string; name: string };

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
          {rows.map((row, index) => (
            <tr key={row.teamId} className="border-t border-border">
              <td className="py-2 pr-2 text-muted">{index + 1}º</td>
              <td className="py-2 pr-2 font-semibold">
                {teamsById.get(row.teamId)?.name ?? "—"}
              </td>
              <td className="px-1.5 py-2 text-center">{row.jogos}</td>
              <td className="px-1.5 py-2 text-center">{row.vitorias}</td>
              <td className="px-1.5 py-2 text-center">{row.derrotas}</td>
              <td className="px-1.5 py-2 text-center">{row.saldo}</td>
              <td className="px-1.5 py-2 text-center font-bold text-gold">{row.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
