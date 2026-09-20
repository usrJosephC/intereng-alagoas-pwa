import { prisma } from "@/lib/prisma";
import { formatDateTimeBR } from "@/lib/datetime";

export const metadata = { title: "Auditoria" };

const ACTION_LABELS: Record<string, string> = {
  "user.role_changed": "Papel de usuário alterado",
  "user.created": "Usuário criado",
  "user.deleted": "Usuário excluído",
  "team.deleted": "Inscrição removida",
  "atletica.deleted": "Atlética excluída",
  "venue.deleted": "Local excluído",
  "match.deleted": "Jogo excluído",
};

export default async function AdminAuditoriaPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Auditoria
      </h1>
      <p className="mt-1 text-sm text-muted">
        Últimas 200 ações sensíveis registradas no sistema (mudança de papel, exclusões).
      </p>

      <ul className="mt-6 space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="steel-border rounded-sm bg-surface p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-gold">
                {ACTION_LABELS[log.action] ?? log.action}
              </span>
              <span className="text-xs text-muted">{formatDateTimeBR(log.createdAt)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Por {log.actor ? `${log.actor.name} (${log.actor.email})` : "conta removida"}
              {log.targetId ? ` · alvo: ${log.targetType} ${log.targetId}` : ""}
            </p>
            {log.metadata !== null && (
              <pre className="mt-1 overflow-x-auto text-[11px] text-muted">
                {JSON.stringify(log.metadata)}
              </pre>
            )}
          </li>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted">Nenhum registro ainda.</p>}
      </ul>
    </div>
  );
}
