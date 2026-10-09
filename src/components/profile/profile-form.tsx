"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";

type User = {
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  birthDate: string | null; // ISO
  city: string | null;
  course: string | null;
  institution: string | null;
  sponsorConsent: boolean;
  instagram: string | null;
  profileVisibleToMembers: boolean;
};

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [phone, setPhone] = useState(user.phone ?? "");
  const initialBirthDate = user.birthDate ? user.birthDate.slice(0, 10) : "";
  const [birthDay, setBirthDay] = useState(initialBirthDate.slice(8, 10));
  const [birthMonth, setBirthMonth] = useState(initialBirthDate.slice(5, 7));
  const [birthYear, setBirthYear] = useState(initialBirthDate.slice(0, 4));
  const [city, setCity] = useState(user.city ?? "");
  const [course, setCourse] = useState(user.course ?? "");
  const [institution, setInstitution] = useState(user.institution ?? "");
  const [sponsorConsent, setSponsorConsent] = useState(user.sponsorConsent);
  const [instagram, setInstagram] = useState(user.instagram ?? "");
  const [profileVisibleToMembers, setProfileVisibleToMembers] = useState(
    user.profileVisibleToMembers,
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletionConfirmation, setDeletionConfirmation] = useState("");
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const currentYear = new Date().getFullYear();
  const daysInMonth = birthMonth
    ? new Date(Number(birthYear) || currentYear, Number(birthMonth), 0).getDate()
    : 31;
  const dateStarted = Boolean(birthDay || birthMonth || birthYear);
  const birthDate = birthDay && birthMonth && birthYear
    ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dateStarted && !birthDate) {
      setError("Preencha dia, mês e ano de nascimento ou deixe os três vazios.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          birthDate,
          city,
          course,
          institution,
          sponsorConsent,
          instagram,
          profileVisibleToMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/profile/photo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Não foi possível enviar a foto.");
      setAvatarUrl(data.avatarUrl);
      router.refresh();
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Não foi possível enviar a foto.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeleteAccount() {
    if (deletionConfirmation !== "EXCLUIR") return;

    setDeleting(true);
    setDeletionError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deletionConfirmation }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeletionError(data?.error || "Não foi possível excluir a conta.");
        return;
      }
      router.replace("/?contaExcluida=1");
      router.refresh();
    } catch {
      setDeletionError("Não foi possível excluir a conta.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saving && <FeedbackMessage tone="loading">Salvando perfil...</FeedbackMessage>}
      {error && <FeedbackMessage tone="error">{error}</FeedbackMessage>}
      {saved && <FeedbackMessage tone="success">Perfil atualizado com sucesso.</FeedbackMessage>}

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
          <label className={labelClass}>Foto de perfil (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={uploadingPhoto}
            className={inputClass}
          />
          {uploadingPhoto && (
            <p className="text-xs text-muted">Enviando foto...</p>
          )}
          {photoError && <p className="text-xs text-danger">{photoError}</p>}
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
        <div className="min-w-0 space-y-1.5 sm:col-span-2">
          <span className={labelClass}>Data de nascimento</span>
          <div className="grid grid-cols-3 gap-2">
            <select aria-label="Dia de nascimento" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className={`${inputClass} min-w-0 px-2`}>
              <option value="">Dia</option>
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => <option key={day} value={String(day).padStart(2, "0")}>{day}</option>)}
            </select>
            <select aria-label="Mês de nascimento" value={birthMonth} onChange={(e) => {
              const month = e.target.value;
              if (birthDay && month && Number(birthDay) > new Date(Number(birthYear) || currentYear, Number(month), 0).getDate()) setBirthDay("");
              setBirthMonth(month);
            }} className={`${inputClass} min-w-0 px-2`}>
              <option value="">Mês</option>
              {months.map((month, index) => <option key={month} value={String(index + 1).padStart(2, "0")}>{month}</option>)}
            </select>
            <select aria-label="Ano de nascimento" value={birthYear} onChange={(e) => {
              const year = e.target.value;
              if (birthDay && birthMonth && Number(birthDay) > new Date(Number(year) || currentYear, Number(birthMonth), 0).getDate()) setBirthDay("");
              setBirthYear(year);
            }} className={`${inputClass} min-w-0 px-2`}>
              <option value="">Ano</option>
              {Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
            </select>
          </div>
          {dateStarted && <button type="button" onClick={() => { setBirthDay(""); setBirthMonth(""); setBirthYear(""); }} className="min-h-[44px] text-xs font-semibold text-muted underline hover:text-gold">Limpar data</button>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Curso</label>
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Instituição de ensino</label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Instagram (opcional)</label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@seu_usuario"
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
          Compartilhar meus dados com o evento (organização e contato sobre
          patrocínio/parceiros). Você pode retirar esse consentimento a qualquer
          momento aqui.
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={profileVisibleToMembers}
          onChange={(e) => setProfileVisibleToMembers(e.target.checked)}
          className="mt-1"
        />
        <span>
          Mostrar meu nome, curso, instituição e Instagram pra outros atletas
          logados no site. Desligado por padrão — ninguém vê esses dados até
          você ativar.
        </span>
      </label>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>

      <section
        className="space-y-3 border-t border-border pt-5"
        aria-labelledby="delete-account-title"
      >
        <div>
          <h2
            id="delete-account-title"
            className="text-sm font-semibold uppercase tracking-wide text-danger"
          >
            Excluir conta
          </h2>
          <p className="mt-1 text-xs text-muted">
            Esta ação é permanente e remove seus dados, publicações, comentários
            e curtidas.
          </p>
        </div>
        <label className={labelClass} htmlFor="delete-account-confirmation">
          Digite &quot;EXCLUIR&quot; para confirmar
        </label>
        <input
          id="delete-account-confirmation"
          value={deletionConfirmation}
          onChange={(e) => setDeletionConfirmation(e.target.value)}
          className={inputClass}
          autoComplete="off"
          disabled={deleting}
        />
        {deleting && <FeedbackMessage tone="loading">Excluindo conta...</FeedbackMessage>}
        {deletionError && <FeedbackMessage tone="error">{deletionError}</FeedbackMessage>}
        <Button
          type="button"
          variant="danger"
          disabled={deleting || deletionConfirmation !== "EXCLUIR"}
          onClick={handleDeleteAccount}
          className="w-full"
        >
          {deleting ? "Excluindo..." : "Excluir minha conta"}
        </Button>
      </section>
    </form>
  );
}
