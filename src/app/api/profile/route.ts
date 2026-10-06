import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountDeletionSchema, profileUpdateSchema } from "@/lib/schemas";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { dateOnlyInputToDate } from "@/lib/datetime";
import { removeImages } from "@/lib/storage";

/** Qualquer usuário logado edita os próprios dados — nunca os de outra conta
 * (o id vem sempre da sessão, nunca do corpo da requisição). */
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const {
    name,
    phone,
    birthDate,
    city,
    course,
    institution,
    sponsorConsent,
    instagram,
    profileVisibleToMembers,
  } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      name,
      phone: phone || null,
      birthDate: birthDate ? dateOnlyInputToDate(birthDate) : null,
      city: city || null,
      course: course || null,
      institution: institution || null,
      ...(sponsorConsent !== undefined ? { sponsorConsent } : {}),
      instagram: instagram || null,
      ...(profileVisibleToMembers !== undefined ? { profileVisibleToMembers } : {}),
    },
    select: {
      name: true,
      avatarUrl: true,
      phone: true,
      birthDate: true,
      city: true,
      course: true,
      institution: true,
      sponsorConsent: true,
      instagram: true,
      profileVisibleToMembers: true,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = accountDeletionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Digite EXCLUIR para confirmar a exclusão da conta." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      avatarUrl: true,
      posts: { select: { imageUrl: true } },
      comments: { select: { imageUrl: true } },
    },
  });
  if (!user) {
    const response = NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  try {
    await removeImages([
      user.avatarUrl,
      ...user.posts.map((post) => post.imageUrl),
      ...user.comments.map((comment) => comment.imageUrl),
    ]);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível remover os arquivos da conta." },
      { status: 503 }
    );
  }

  const deleted = await prisma.user.deleteMany({ where: { id: session.sub } });
  if (deleted.count !== 1) {
    const response = NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
