"use client";

import { useState } from "react";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";

type Venue = { id: string; name: string; address: string | null };

export function VenuesManager({ initialVenues }: { initialVenues: Venue[] }) {
  const [venues, setVenues] = useState(initialVenues);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar.");
      setVenues((prev) => [...prev, data.venue]);
      setName("");
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este local?")) return;
    const res = await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Não foi possível remover.");
      return;
    }
    setVenues((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {venues.map((venue) => (
          <li
            key={venue.id}
            className="steel-border flex items-center justify-between gap-3 rounded-sm bg-surface p-3"
          >
            <div>
              <p className="font-semibold">{venue.name}</p>
              {venue.address && <p className="text-xs text-muted">{venue.address}</p>}
            </div>
            <button onClick={() => handleDelete(venue.id)} className={smallButtonClass}>
              Remover
            </button>
          </li>
        ))}
        {venues.length === 0 && <p className="text-sm text-muted">Nenhum local cadastrado ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="steel-border space-y-3 rounded-sm bg-surface p-4">
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nome do local (ex: Ginásio X)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Endereço (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "+ Novo local"}
        </Button>
      </form>
    </div>
  );
}
