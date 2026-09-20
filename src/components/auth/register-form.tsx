"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

type Atletica = { id: string; name: string };

export function RegisterForm({ atleticas }: { atleticas: Atletica[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [atleticaId, setAtleticaId] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [sponsorConsent, setSponsorConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
            placeholder="(82) 9xxxx-xxxx"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data de nascimento (opcional)</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade (opcional)</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Curso (opcional)</label>
          <input value={course} onChange={(e) => setCourse(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Instituição de ensino (opcional)</label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputClass}
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
