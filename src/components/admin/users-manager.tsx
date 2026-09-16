"use client";

import { useState } from "react";
import { inputClass, smallButtonClass } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { formatDateOnlyBR } from "@/lib/datetime";

type Role = "MASTER" | "ADMIN" | "ORGANIZADOR" | "SUMULA" | "MEMBER";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  birthDate: string | null; // ISO
  city: string | null;
  course: string | null;
  institution: string | null;
  sponsorConsent: boolean;
  createdAt: string;
  atletica: { name: string } | null;
};

const ROLE_LABELS: Record<Role, string> = {
  MASTER: "Master (dono do sistema)",
  ADMIN: "Diretoria (admin)",
  ORGANIZADOR: "Organizador de esportes",
  SUMULA: "Súmula",
  MEMBER: "Torcida/atleta",
};

export function UsersManager({
  initialUsers,
  viewerRole,
  viewerId,
}: {
  initialUsers: UserRow[];
  viewerRole: "MASTER" | "ADMIN";
  viewerId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const isMaster = viewerRole === "MASTER";
  const assignableRoles = isMaster
    ? (["MASTER", "ADMIN", "ORGANIZADOR", "SUMULA", "MEMBER"] as const)
    : (["ADMIN", "ORGANIZADOR", "SUMULA", "MEMBER"] as const);

  async function handleRoleChange(id: string, role: Role) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Não foi possível atualizar o papel.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: data.user.role } : u)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esse usuário? Essa ação não pode ser desfeita.")) return;
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Não foi possível excluir.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const leadFields = (user: UserRow) => {
    const parts = [
      user.phone,
      user.birthDate ? `nasc. ${formatDateOnlyBR(new Date(user.birthDate))}` : null,
      user.city,
      user.course,
      user.institution,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <ul className="space-y-2">
        {users.map((user) => {
          const targetIsMaster = user.role === "MASTER";
          const isSelf = user.id === viewerId;
          const canEditRole = !isSelf && (isMaster || !targetIsMaster);
          const canDelete = isMaster && !isSelf;
          return (
            <li
              key={user.id}
              className="steel-border flex flex-col gap-2 rounded-sm bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {user.name}
                  {isSelf && <span className="ml-2 text-xs font-normal text-gold">(você)</span>}
                  {user.atletica && (
                    <span className="ml-2 text-xs font-normal text-muted">{user.atletica.name}</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                {leadFields(user) && (
                  <p className="mt-0.5 truncate text-xs text-muted">{leadFields(user)}</p>
                )}
                {user.sponsorConsent && (
                  <span className="mt-1 inline-block rounded-sm border border-gold-dark px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                    Aceita compartilhar dados com o evento
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={user.role}
                  disabled={!canEditRole}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  className={`${inputClass} sm:w-56`}
                >
                  {(canEditRole ? assignableRoles : ([user.role] as const)).map((value) => (
                    <option key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </option>
                  ))}
                </select>
                {canDelete && (
                  <button onClick={() => handleDelete(user.id)} className={smallButtonClass}>
                    Excluir
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {users.length === 0 && <p className="text-sm text-muted">Nenhum usuário cadastrado.</p>}
      </ul>

      {isMaster && (
        <NewUserForm
          onCreated={(user) => setUsers((prev) => [user, ...prev])}
          onError={setError}
        />
      )}
    </div>
  );
}

function NewUserForm({
  onCreated,
  onError,
}: {
  onCreated: (user: UserRow) => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível criar a conta.");
        return;
      }
      onCreated({ ...data.user, createdAt: new Date().toISOString(), birthDate: null });
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold">
        Criar conta diretamente
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          required
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputClass}
        >
          {(["MASTER", "ADMIN", "ORGANIZADOR", "SUMULA", "MEMBER"] as const).map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Criando..." : "+ Criar conta"}
      </Button>
    </form>
  );
}
