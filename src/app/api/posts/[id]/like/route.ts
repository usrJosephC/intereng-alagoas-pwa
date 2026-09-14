import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para curtir." }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.sub } },
  });

  if (existing) {
    await prisma.postLike.delete({
      where: { postId_userId: { postId: id, userId: session.sub } },
    });
    const count = await prisma.postLike.count({ where: { postId: id } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.postLike.create({ data: { postId: id, userId: session.sub } });
  const count = await prisma.postLike.count({ where: { postId: id } });
  return NextResponse.json({ liked: true, count });
}
