import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { dateOnlyInputToDate } from "@/lib/datetime";

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

  const { name, avatarUrl, phone, birthDate, city, course, institution, sponsorConsent } =
    parsed.data;

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      name,
      avatarUrl: avatarUrl || null,
      phone: phone || null,
      birthDate: birthDate ? dateOnlyInputToDate(birthDate) : null,
      city: city || null,
      course: course || null,
      institution: institution || null,
      ...(sponsorConsent !== undefined ? { sponsorConsent } : {}),
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
    },
  });

  return NextResponse.json({ user });
}
