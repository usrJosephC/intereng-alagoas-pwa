import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre para excluir." }, { status: 401 });
  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id }, select: { authorId: true } });
  if (!comment) return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  if (comment.authorId !== session.sub && !canAccessAdmin(session.role)) {
    return NextResponse.json({ error: "Sem permissão para excluir este comentário." }, { status: 403 });
  }
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
