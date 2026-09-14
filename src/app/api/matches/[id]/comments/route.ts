import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { commentCreateSchema } from "@/lib/schemas";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { matchId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para comentar." }, { status: 401 });
  }
  const { id } = await params;

  const match = await prisma.match.findUnique({ where: { id }, select: { id: true } });
  if (!match) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { content: parsed.data.content, matchId: id, authorId: session.sub },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
