"use client";

import { useState } from "react";
import type { Category, Sport } from "@prisma/client";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";

type Atletica = { id: string; name: string };
type Team = { id: string; atletica: Atletica };

export function TimesManager({
  sport,
  category,
  initialTeams,
  allAtleticas,
}: {
  sport: Sport;
  category: Category;
  initialTeams: Team[];
  allAtleticas: Atletica[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [atleticaId, setAtleticaId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrolledIds = new Set(teams.map((t) => t.atletica.id));
  const available = allAtleticas.filter((a) => !enrolledIds.has(a.id));

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!atleticaId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, category, atleticaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível inscrever.");
      setTeams((prev) => [...prev, data.team]);
      setAtleticaId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível inscrever.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(teamId: string) {
    if (!confirm("Remover esta inscrição?")) return;
    const res = await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Não foi possível remover.");
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {teams.map((team) => (
          <li
            key={team.id}
            className="steel-border flex items-center justify-between gap-3 rounded-sm bg-surface p-3"
          >
            <p className="font-semibold">{team.atletica.name}</p>
            <button onClick={() => handleRemove(team.id)} className={smallButtonClass}>
              Remover
            </button>
          </li>
        ))}
        {teams.length === 0 && (
          <p className="text-sm text-muted">Nenhuma atlética inscrita neste esporte ainda.</p>
        )}
      </ul>

      {available.length > 0 ? (
        <form onSubmit={handleEnroll} className="steel-border flex flex-wrap gap-3 rounded-sm bg-surface p-4">
          {error && <p className="w-full text-xs text-danger">{error}</p>}
          <select
            value={atleticaId}
            onChange={(e) => setAtleticaId(e.target.value)}
            className={`${inputClass} sm:max-w-xs`}
          >
            <option value="">Selecione uma atlética</option>
            {available.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={saving || !atleticaId}>
            {saving ? "Inscrevendo..." : "Inscrever"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Todas as atléticas cadastradas já estão inscritas. Cadastre mais em Atléticas.
        </p>
      )}
    </div>
  );
}
