import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { sport: true, category: true, atletica: { select: { name: true } } },
  });
  try {
    await prisma.team.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Não é possível remover: a inscrição já está vinculada a grupos/jogos." },
      { status: 409 }
    );
  }
  const session = await getSession();
  await registrarAuditoria({
    actorId: session?.sub ?? null,
    action: "team.deleted",
    targetType: "Team",
    targetId: id,
    metadata: team ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
