import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchUpdateSchema } from "@/lib/schemas";
import { localInputToDate } from "@/lib/datetime";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = matchUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { matchDate, venueId, ...rest } = parsed.data;

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...rest,
      ...(matchDate !== undefined ? { matchDate: localInputToDate(matchDate) } : {}),
      ...(venueId !== undefined ? { venueId: venueId || null } : {}),
    },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  return NextResponse.json({ match });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.match.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
