"use client";

import { useState } from "react";
import type { Category, Sport } from "@prisma/client";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { PHASE_LABELS, STATUS_LABELS } from "@/lib/sports";
import { dateToLocalInput } from "@/lib/datetime";

type Team = { id: string; atletica: { name: string } };
type Group = { id: string; name: string };
type Venue = { id: string; name: string };

type Match = {
  id: string;
  phase: string;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  matchDate: string; // ISO
  teamA: Team;
  teamB: Team;
  venue: Venue | null;
};

const PHASES = Object.keys(PHASE_LABELS);
const STATUSES = Object.keys(STATUS_LABELS);

export function JogosManager({
  sport,
  category,
  initialMatches,
  teams,
  groups,
  venues,
}: {
  sport: Sport;
  category: Category;
  initialMatches: Match[];
  teams: Team[];
  groups: Group[];
  venues: Venue[];
}) {
  const [matches, setMatches] = useState(initialMatches);

  function handleUpdated(match: Match) {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? match : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este jogo?")) return;
    const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
    if (res.ok) setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {matches
          .slice()
          .sort((a, b) => a.matchDate.localeCompare(b.matchDate))
          .map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              venues={venues}
              onUpdated={handleUpdated}
              onDelete={() => handleDelete(match.id)}
            />
          ))}
        {matches.length === 0 && (
          <p className="text-sm text-muted">Nenhum jogo cadastrado ainda para este esporte.</p>
        )}
      </ul>

      <GerarJogosAutomaticos
        sport={sport}
        category={category}
        hasGroups={groups.length > 0}
        onGenerated={(newMatches) => setMatches((prev) => [...prev, ...newMatches])}
      />

      <NewMatchForm
        sport={sport}
        category={category}
        teams={teams}
        groups={groups}
        venues={venues}
        onCreated={(match) => setMatches((prev) => [...prev, match])}
      />
    </div>
  );
}

function GerarJogosAutomaticos({
  sport,
  category,
  hasGroups,
  onGenerated,
}: {
  sport: Sport;
  category: Category;
  hasGroups: boolean;
  onGenerated: (matches: Match[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/groups/generate-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível gerar os jogos.");
      onGenerated(data.matches);
      setResult({ created: data.created, skipped: data.skipped });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar os jogos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="steel-border space-y-2 rounded-sm bg-surface p-4">
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">
        Gerar jogos da fase de grupos automaticamente
      </p>
      <p className="text-xs text-muted">
        Cria todos os confrontos (cada time contra cada time do mesmo grupo) de uma vez. Depois é
        só entrar em cada jogo e definir ginásio e horário — confrontos que já existem não são
        duplicados.
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
      {result && (
        <p className="text-xs text-success">
          {result.created} jogo(s) criado(s)
          {result.skipped > 0 ? `, ${result.skipped} já existia(m).` : "."}
        </p>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !hasGroups}
        className={smallButtonClass}
      >
        {loading ? "Gerando..." : "Gerar jogos automaticamente"}
      </button>
      {!hasGroups && <p className="text-xs text-muted">Sorteie os grupos primeiro.</p>}
    </div>
  );
}

function MatchRow({
  match,
  venues,
  onUpdated,
  onDelete,
}: {
  match: Match;
  venues: Venue[];
  onUpdated: (match: Match) => void;
  onDelete: () => void;
}) {
  const [scoreA, setScoreA] = useState(match.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.scoreB?.toString() ?? "");
  const [status, setStatus] = useState(match.status);
  const [venueId, setVenueId] = useState(match.venue?.id ?? "");
  const [matchDate, setMatchDate] = useState(dateToLocalInput(new Date(match.matchDate)));
  const [saving, setSaving] = useState(false);

  async function handleSave(forceConflict = false) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA: scoreA === "" ? null : Number(scoreA),
          scoreB: scoreB === "" ? null : Number(scoreB),
          status,
          venueId: venueId || null,
          matchDate,
          forceConflict,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.conflict && !forceConflict && confirm(`${data.error} Salvar mesmo assim?`)) {
          return handleSave(true);
        }
        throw new Error(data.error || "Não foi possível salvar.");
      }
      onUpdated(data.match);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="steel-border space-y-3 rounded-sm bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-sm font-semibold">
          {match.teamA.atletica.name} vs {match.teamB.atletica.name}
        </p>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {PHASE_LABELS[match.phase]}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className={inputClass}>
          <option value="">Local a definir</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={() => handleSave()} disabled={saving} className={smallButtonClass}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={onDelete} className={smallButtonClass}>
          Remover
        </button>
      </div>
    </li>
  );
}

function NewMatchForm({
  sport,
  category,
  teams,
  groups,
  venues,
  onCreated,
}: {
  sport: Sport;
  category: Category;
  teams: Team[];
  groups: Group[];
  venues: Venue[];
  onCreated: (match: Match) => void;
}) {
  const [phase, setPhase] = useState("GRUPOS");
  const [groupId, setGroupId] = useState("");
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent, forceConflict = false) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          category,
          phase,
          groupId: phase === "GRUPOS" ? groupId : "",
          teamAId,
          teamBId,
          venueId,
          matchDate,
          forceConflict,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.conflict && !forceConflict && confirm(`${data.error} Criar mesmo assim?`)) {
          return handleSubmit(e, true);
        }
        throw new Error(data.error || "Não foi possível criar o jogo.");
      }
      onCreated(data.match);
      setTeamAId("");
      setTeamBId("");
      setMatchDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o jogo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">
        Novo jogo
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select value={phase} onChange={(e) => setPhase(e.target.value)} className={inputClass}>
          {PHASES.map((p) => (
            <option key={p} value={p}>
              {PHASE_LABELS[p]}
            </option>
          ))}
        </select>

        {phase === "GRUPOS" && (
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={inputClass}>
            <option value="">Sem grupo específico</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}

        <select
          required
          value={teamAId}
          onChange={(e) => setTeamAId(e.target.value)}
          className={inputClass}
        >
          <option value="">Time A</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.atletica.name}
            </option>
          ))}
        </select>

        <select
          required
          value={teamBId}
          onChange={(e) => setTeamBId(e.target.value)}
          className={inputClass}
        >
          <option value="">Time B</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.atletica.name}
            </option>
          ))}
        </select>

        <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className={inputClass}>
          <option value="">Local a definir</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <input
          required
          type="datetime-local"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Criando..." : "+ Criar jogo"}
      </Button>
    </form>
  );
}
