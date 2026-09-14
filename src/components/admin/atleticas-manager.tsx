"use client";

import { useState } from "react";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";

type Atletica = { id: string; name: string; shortName: string | null };

export function AtleticasManager({ initialAtleticas }: { initialAtleticas: Atletica[] }) {
  const [atleticas, setAtleticas] = useState(initialAtleticas);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/atleticas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shortName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar.");
      setAtleticas((prev) => [...prev, data.atletica]);
      setName("");
      setShortName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta atlética?")) return;
    const res = await fetch(`/api/admin/atleticas/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Não foi possível remover.");
      return;
    }
    setAtleticas((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {atleticas.map((atletica) => (
          <li
            key={atletica.id}
            className="steel-border flex items-center justify-between gap-3 rounded-sm bg-surface p-3"
          >
            <div>
              <p className="font-semibold">{atletica.name}</p>
              {atletica.shortName && <p className="text-xs text-muted">{atletica.shortName}</p>}
            </div>
            <button onClick={() => handleDelete(atletica.id)} className={smallButtonClass}>
              Remover
            </button>
          </li>
        ))}
        {atleticas.length === 0 && (
          <p className="text-sm text-muted">Nenhuma atlética cadastrada ainda.</p>
        )}
      </ul>

      <form onSubmit={handleCreate} className="steel-border space-y-3 rounded-sm bg-surface p-4">
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nome da atlética"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Sigla (opcional)"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "+ Nova atlética"}
        </Button>
      </form>
    </div>
  );
}
