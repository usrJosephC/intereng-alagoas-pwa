import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { atleticaSchema } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = atleticaSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const atletica = await prisma.atletica.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.shortName !== undefined ? { shortName: parsed.data.shortName || null } : {}),
      ...(parsed.data.logoUrl !== undefined ? { logoUrl: parsed.data.logoUrl || null } : {}),
    },
  });

  return NextResponse.json({ atletica });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const atletica = await prisma.atletica.findUnique({ where: { id }, select: { name: true } });
  try {
    await prisma.atletica.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Não é possível remover: a atlética tem times/inscrições vinculadas." },
      { status: 409 }
    );
  }
  const session = await getSession();
  await registrarAuditoria({
    actorId: session?.sub ?? null,
    action: "atletica.deleted",
    targetType: "Atletica",
    targetId: id,
    metadata: atletica ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
