import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Grava uma ação sensível no log de auditoria (só MASTER lê, em
 * `/admin/auditoria`). Nunca lança — um log falho não pode derrubar a ação
 * que ele está registrando.
 */
export async function registrarAuditoria(params: {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (err) {
    console.error("Falha ao registrar auditoria:", err);
  }
}
