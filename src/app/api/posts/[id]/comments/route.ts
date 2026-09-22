import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { commentCreateSchema } from "@/lib/schemas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para comentar." }, { status: 401 });
  }
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl || null,
      postId: id,
      authorId: session.sub,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
