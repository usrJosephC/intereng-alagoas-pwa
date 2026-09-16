import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchSumulaUpdateSchema } from "@/lib/schemas";

/** Papel SUMULA: só placar, status e observações — nunca times, local, data ou fase. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = matchSumulaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const match = await prisma.match.update({
    where: { id },
    data: parsed.data,
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return NextResponse.json({ match });
}
