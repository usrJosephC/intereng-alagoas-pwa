import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { postCreateSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para publicar." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Post inválido." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl || null,
      authorId: session.sub,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      likes: true,
      comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
