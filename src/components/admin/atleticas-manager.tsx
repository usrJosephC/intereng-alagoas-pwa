"use client";

import { useState } from "react";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { AtleticaLogo } from "@/components/ui/atletica-logo";

type Atletica = { id: string; name: string; shortName: string | null; logoUrl: string | null };

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

  function handleLogoUpdated(id: string, newLogoUrl: string) {
    setAtleticas((prev) => prev.map((a) => (a.id === id ? { ...a, logoUrl: newLogoUrl } : a)));
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {atleticas.map((atletica) => (
          <AtleticaRow
            key={atletica.id}
            atletica={atletica}
            onDelete={() => handleDelete(atletica.id)}
            onLogoUpdated={(url) => handleLogoUpdated(atletica.id, url)}
          />
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
        <p className="text-xs text-muted">O logo é enviado depois de criar, na lista abaixo.</p>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "+ Nova atlética"}
        </Button>
      </form>
    </div>
  );
}

function AtleticaRow({
  atletica,
  onDelete,
  onLogoUpdated,
}: {
  atletica: Atletica;
  onDelete: () => void;
  onLogoUpdated: (logoUrl: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/admin/atleticas/${atletica.id}/logo`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar o logo.");
      onLogoUpdated(data.atletica.logoUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o logo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <li className="steel-border flex flex-wrap items-center gap-3 rounded-sm bg-surface p-3">
      <AtleticaLogo name={atletica.name} logoUrl={atletica.logoUrl} className="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{atletica.name}</p>
        {atletica.shortName && <p className="text-xs text-muted">{atletica.shortName}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        disabled={uploading}
        className={`${inputClass} w-full sm:w-56`}
      />
      {uploading && <span className="text-xs text-muted">Enviando...</span>}
      <button onClick={onDelete} className={smallButtonClass}>
        Remover
      </button>
    </li>
  );
}
