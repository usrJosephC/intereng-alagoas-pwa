"use client";

import { useMemo, useState } from "react";
import { inputClass, smallButtonClass } from "@/lib/ui";
import {
  SPORT_LABELS,
  CATEGORY_LABELS,
  PHASE_LABELS,
  STATUS_LABELS,
} from "@/lib/sports";
import { formatDateTimeBR } from "@/lib/datetime";

type Team = { atletica: { name: string } };

type Match = {
  id: string;
  sport: keyof typeof SPORT_LABELS;
  category: keyof typeof CATEGORY_LABELS;
  phase: keyof typeof PHASE_LABELS;
  status: keyof typeof STATUS_LABELS;
  scoreA: number | null;
  scoreB: number | null;
  notes: string | null;
  matchDate: string; // ISO
  teamA: Team;
  teamB: Team;
  venue: { name: string } | null;
};

const STATUSES = Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[];

export function SumulaMatches({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [search, setSearch] = useState("");

  function handleUpdated(match: Match) {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? match : m)));
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return matches;
    return matches.filter(
      (m) =>
        m.teamA.atletica.name.toLowerCase().includes(term) ||
        m.teamB.atletica.name.toLowerCase().includes(term)
    );
  }, [matches, search]);

  return (
    <div className="space-y-4">
      <input
        placeholder="Buscar por atlética..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${inputClass} max-w-sm`}
      />

      <ul className="space-y-3">
        {filtered.map((match) => (
          <SumulaMatchRow key={match.id} match={match} onUpdated={handleUpdated} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted">Nenhum jogo encontrado.</p>}
      </ul>
    </div>
  );
}

function SumulaMatchRow({
  match,
  onUpdated,
}: {
  match: Match;
  onUpdated: (match: Match) => void;
}) {
  const [scoreA, setScoreA] = useState(match.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.scoreB?.toString() ?? "");
  const [status, setStatus] = useState(match.status);
  const [notes, setNotes] = useState(match.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/sumula/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA: scoreA === "" ? null : Number(scoreA),
          scoreB: scoreB === "" ? null : Number(scoreB),
          status,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      onUpdated(data.match);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="steel-border space-y-3 rounded-sm bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm font-semibold">
          {match.teamA.atletica.name} vs {match.teamB.atletica.name}
        </p>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {SPORT_LABELS[match.sport]} {CATEGORY_LABELS[match.category]} · {PHASE_LABELS[match.phase]}
        </span>
      </div>
      <p className="text-xs text-muted">
        {formatDateTimeBR(new Date(match.matchDate))} · {match.venue?.name ?? "Local a definir"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="number"
          min={0}
          placeholder="Placar A"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          placeholder="Placar B"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className={inputClass}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Match["status"])}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Observações (cartões, ocorrências...)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className={`${inputClass} resize-none`}
      />

      <button onClick={handleSave} disabled={saving} className={smallButtonClass}>
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </li>
  );
}
