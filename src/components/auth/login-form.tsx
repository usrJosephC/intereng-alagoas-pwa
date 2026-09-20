"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { roleHomePath } from "@/lib/roles";

export function LoginForm({ redirectAfter }: { redirectAfter?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "E-mail ou senha inválidos." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível entrar.");
        return;
      }
      const from = searchParams.get("from");
      const isAdminish =
        data.role === "MASTER" ||
        data.role === "ADMIN" ||
        data.role === "ORGANIZADOR" ||
        data.role === "SUMULA";
      router.push(from ?? (isAdminish ? roleHomePath(data.role) : redirectAfter ?? "/"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-danger">{error}</p>}
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
        <div className="flex items-center justify-between">
          <label className={labelClass}>Senha</label>
          <Link href="/esqueci-senha" className="text-xs font-semibold text-gold hover:text-gold-soft">
            Esqueci minha senha
          </Link>
        </div>
        <PasswordInput
          required
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
