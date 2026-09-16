import type { Role } from "@prisma/client";

/** Home de cada papel após o login — usado tanto no servidor quanto no cliente. */
export function roleHomePath(role: Role): string {
  if (role === "MASTER" || role === "ADMIN" || role === "ORGANIZADOR") return "/admin";
  if (role === "SUMULA") return "/admin/sumula";
  return "/";
}

/** MASTER, ADMIN e ORGANIZADOR têm o mesmo acesso ao painel, exceto onde marcado. */
export function canAccessAdmin(role: Role): boolean {
  return role === "MASTER" || role === "ADMIN" || role === "ORGANIZADOR";
}

export function canAccessSumula(role: Role): boolean {
  return (
    role === "MASTER" || role === "ADMIN" || role === "ORGANIZADOR" || role === "SUMULA"
  );
}

/** Só MASTER gerencia usuários (criar/editar/excluir, inclusive outros ADMIN)
 * e vê o log de auditoria — pensado como o papel do dono/desenvolvedor do
 * sistema, não da diretoria do evento. */
export function isMaster(role: Role): boolean {
  return role === "MASTER";
}

/** ADMIN ainda pode abrir a tela de usuários pra promover ORGANIZADOR/SUMULA
 * (comportamento herdado), só não pode tocar em contas MASTER nem excluir/criar. */
export function canOpenUsersPage(role: Role): boolean {
  return role === "MASTER" || role === "ADMIN";
}
