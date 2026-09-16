import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await prisma.venue.findUnique({ where: { id }, select: { name: true } });
  try {
    await prisma.venue.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Não é possível remover: o local está vinculado a jogos." },
      { status: 409 }
    );
  }
  const session = await getSession();
  await registrarAuditoria({
    actorId: session?.sub ?? null,
    action: "venue.deleted",
    targetType: "Venue",
    targetId: id,
    metadata: venue ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
