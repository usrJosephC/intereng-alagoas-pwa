import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { userCreateSchema } from "@/lib/schemas";
import { getSession, hashPassword } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/audit";

/** Criação direta de conta (diretoria/organizador/súmula/admin) sem passar
 * pelo autocadastro público — só MASTER usa isso. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MASTER") {
    return NextResponse.json({ error: "Só MASTER pode criar contas diretamente." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
    select: {
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
    },
  });

  await registrarAuditoria({
    actorId: session.sub,
    action: "user.created",
    targetType: "User",
    targetId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ user }, { status: 201 });
}
