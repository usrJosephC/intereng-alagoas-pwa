"use client";

import { useEffect, useRef, useState } from "react";
import type { Sport } from "@prisma/client";
import { inputClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";

type Group = {
  id: string;
  name: string;
  teams: { team: { id: string; atletica: { name: string } } }[];
};

const REVEAL_INTERVAL_MS = 3000;

export function GruposSorteio({
  sport,
  initialGroups,
  teamCount,
}: {
  sport: Sport;
  initialGroups: Group[];
  teamCount: number;
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [groupCount, setGroupCount] = useState(Math.max(2, Math.min(4, teamCount)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Quantos times (por grupo) já foram revelados. Começa "cheio" para o carregamento
  // inicial da página — só volta a animar depois de um sorteio novo, ao vivo.
  const [revealCount, setRevealCount] = useState(Infinity);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxTeamsInGroup = Math.max(0, ...groups.map((g) => g.teams.length));
  const revealing = revealCount < maxTeamsInGroup;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function stopReveal() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startReveal(newGroups: Group[]) {
    stopReveal();
    const total = Math.max(0, ...newGroups.map((g) => g.teams.length));
    setGroups(newGroups);
    setRevealCount(total > 0 ? 1 : 0); // cabeças de grupo aparecem na hora

    intervalRef.current = setInterval(() => {
      setRevealCount((prev) => {
        const next = prev + 1;
        if (next >= total) stopReveal();
        return next;
      });
    }, REVEAL_INTERVAL_MS);
  }

  function handleRevealAll() {
    stopReveal();
    setRevealCount(Infinity);
  }

  async function handleDraw() {
    if (groups.length > 0) {
      const confirmed = confirm(
        "Isso vai apagar os grupos atuais e sortear novamente. Continuar?"
      );
      if (!confirmed) return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/groups/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, groupCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível sortear.");
      // Cabeças de grupo (1ª posição de cada grupo) já saem visíveis; o resto
      // entra a cada 3s — dá pra acompanhar ao vivo no Insta sem cortar o suspense.
      startReveal(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível sortear.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="steel-border flex flex-wrap items-end gap-3 rounded-sm bg-surface p-4">
        {error && <p className="w-full text-xs text-danger">{error}</p>}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Número de grupos
          </label>
          <input
            type="number"
            min={1}
            max={teamCount || 1}
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className={`${inputClass} w-28`}
          />
        </div>
        <Button onClick={handleDraw} disabled={loading || teamCount === 0}>
          {loading ? "Sorteando..." : groups.length > 0 ? "Sortear novamente" : "Sortear grupos"}
        </Button>
        {revealing && (
          <button
            type="button"
            onClick={handleRevealAll}
            className="min-h-[40px] rounded-sm border border-border px-3 text-xs font-semibold uppercase tracking-wide text-muted hover:border-gold hover:text-gold"
          >
            Revelar tudo
          </button>
        )}
        <span className="text-xs text-muted">{teamCount} time(s) inscrito(s) neste esporte.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="steel-border rounded-sm bg-surface p-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">
              {group.name}
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {group.teams.map((gt, index) => {
                if (index >= revealCount) {
                  return (
                    <li
                      key={gt.team.id}
                      className="reveal-pending rounded-sm border border-dashed border-border px-2 py-0.5 text-muted"
                    >
                      Sorteando...
                    </li>
                  );
                }
                return (
                  <li key={gt.team.id} className={index === revealCount - 1 ? "reveal-in" : ""}>
                    {index === 0 && (
                      <span className="mr-1.5 text-[10px] font-semibold uppercase text-gold-dark">
                        Cabeça
                      </span>
                    )}
                    {gt.team.atletica.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-muted">Nenhum grupo sorteado ainda para este esporte.</p>
      )}
    </div>
  );
}
