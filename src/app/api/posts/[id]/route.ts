import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre para excluir." }, { status: 401 });
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  if (post.authorId !== session.sub && !canAccessAdmin(session.role)) {
    return NextResponse.json({ error: "Sem permissão para excluir este post." }, { status: 403 });
  }
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
