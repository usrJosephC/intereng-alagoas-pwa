import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.venue.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Não é possível remover: o local está vinculado a jogos." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
