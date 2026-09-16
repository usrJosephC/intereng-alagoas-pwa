import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { userRoleUpdateSchema } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  birthDate: true,
  city: true,
  course: true,
  institution: true,
  sponsorConsent: true,
  atletica: { select: { name: true } },
} as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = userRoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }
  if (session.sub === id) {
    return NextResponse.json({ error: "Você não pode alterar seu próprio papel." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const touchesMaster = target.role === "MASTER" || parsed.data.role === "MASTER";
  if (touchesMaster && session.role !== "MASTER") {
    return NextResponse.json(
      { error: "Só MASTER pode conceder ou alterar o papel MASTER." },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: USER_SELECT,
  });

  await registrarAuditoria({
    actorId: session.sub,
    action: "user.role_changed",
    targetType: "User",
    targetId: id,
    metadata: { from: target.role, to: parsed.data.role, email: user.email },
  });

  return NextResponse.json({ user });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getSession();
  if (!session || session.role !== "MASTER") {
    return NextResponse.json({ error: "Só MASTER pode excluir usuários." }, { status: 403 });
  }
  if (session.sub === id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  await registrarAuditoria({
    actorId: session.sub,
    action: "user.deleted",
    targetType: "User",
    targetId: id,
    metadata: { email: target.email, role: target.role },
  });

  return NextResponse.json({ ok: true });
}
