import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.team.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Não é possível remover: a inscrição já está vinculada a grupos/jogos." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
