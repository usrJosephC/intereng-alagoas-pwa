"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";

type User = {
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  birthDate: string | null; // ISO
  city: string | null;
  course: string | null;
  institution: string | null;
  sponsorConsent: boolean;
};

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [birthDate, setBirthDate] = useState(user.birthDate ? user.birthDate.slice(0, 10) : "");
  const [city, setCity] = useState(user.city ?? "");
  const [course, setCourse] = useState(user.course ?? "");
  const [institution, setInstitution] = useState(user.institution ?? "");
  const [sponsorConsent, setSponsorConsent] = useState(user.sponsorConsent);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatarUrl,
          phone,
          birthDate,
          city,
          course,
          institution,
          sponsorConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Perfil atualizado.</p>}

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária, não dá pra otimizar via next/image sem configurar domínios
          <img
            src={avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-elevated text-lg font-semibold text-muted">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <label className={labelClass}>URL da foto (opcional)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data de nascimento</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Curso</label>
          <input value={course} onChange={(e) => setCourse(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Instituição de ensino</label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={sponsorConsent}
          onChange={(e) => setSponsorConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          Compartilhar meus dados com o evento (organização e contato sobre patrocínio/parceiros).
          Você pode retirar esse consentimento a qualquer momento aqui.
        </span>
      </label>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
