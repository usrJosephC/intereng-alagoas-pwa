"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

type Atletica = { id: string; name: string };

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function RegisterForm({ atleticas }: { atleticas: Atletica[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [atleticaId, setAtleticaId] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [city, setCity] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [sponsorConsent, setSponsorConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          atleticaId,
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
        setError(data.error || "Não foi possível criar sua conta.");
        return;
      }
      router.push("/comunidade");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="space-y-1.5">
        <label className={labelClass}>Nome</label>
        <input
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>E-mail</label>
        <input
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Senha</label>
        <PasswordInput
          required
          minLength={6}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Torcida de qual atlética? (opcional)</label>
        <select
          value={atleticaId}
          onChange={(e) => setAtleticaId(e.target.value)}
          className={inputClass}
        >
          <option value="">Prefiro não dizer</option>
          {atleticas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone (opcional)</label>
          <input
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
            placeholder="(82) 9xxxx-xxxx"
          />
        </div>
        <div className="min-w-0 space-y-1.5 sm:col-span-2">
          <span className={labelClass}>Data de nascimento (opcional)</span>
          <div className="grid grid-cols-3 gap-2">
            <select
              aria-label="Dia de nascimento"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className={`${inputClass} min-w-0 px-2`}
            >
              <option value="">Dia</option>
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              aria-label="Mês de nascimento"
              value={birthMonth}
              onChange={(e) => {
                const month = e.target.value;
                if (birthDay && month && Number(birthDay) > new Date(Number(birthYear) || currentYear, Number(month), 0).getDate()) setBirthDay("");
                setBirthMonth(month);
              }}
              className={`${inputClass} min-w-0 px-2`}
            >
              <option value="">Mês</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              aria-label="Ano de nascimento"
              value={birthYear}
              onChange={(e) => {
                const year = e.target.value;
                if (birthDay && birthMonth && Number(birthDay) > new Date(Number(year) || currentYear, Number(birthMonth), 0).getDate()) setBirthDay("");
                setBirthYear(year);
              }}
              className={`${inputClass} min-w-0 px-2`}
            >
              <option value="">Ano</option>
              {Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {dateStarted && (
            <button
              type="button"
              onClick={() => { setBirthDay(""); setBirthMonth(""); setBirthYear(""); }}
              className="min-h-[44px] text-xs font-semibold text-muted underline hover:text-gold"
            >
              Limpar data
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade (opcional)</label>
          <input
            maxLength={200}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Curso (opcional)</label>
          <textarea
            maxLength={200}
            rows={2}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Instituição de ensino (opcional)</label>
          <textarea
            maxLength={200}
            rows={2}
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      <label className="steel-border flex items-start gap-2 rounded-sm bg-surface p-3 text-sm">
        <input
          required
          type="checkbox"
          checked={sponsorConsent}
          onChange={(e) => setSponsorConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          <strong className="text-gold">Compartilhar dados com o evento (obrigatório).</strong>{" "}
          Autorizo o InterEng Alagoas a usar meus dados de cadastro (nome, contato, atlética e o
          que eu preencher acima) para fins de organização do evento e para contato sobre
          oportunidades de patrocínio e parceiros. Sem esse consentimento não é possível criar
          conta na comunidade.
        </span>
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
