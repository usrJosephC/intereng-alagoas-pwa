import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { atleticaSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = atleticaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.atletica.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma atlética com esse nome." }, { status: 409 });
  }

  const atletica = await prisma.atletica.create({
    data: {
      name: parsed.data.name,
      shortName: parsed.data.shortName || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  return NextResponse.json({ atletica }, { status: 201 });
}
