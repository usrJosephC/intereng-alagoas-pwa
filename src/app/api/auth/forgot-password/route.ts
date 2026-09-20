import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/schemas";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

// Mesma resposta genérica exista ou não a conta — não dá pra usar esse
// endpoint pra descobrir se um e-mail está cadastrado.
function genericOk() {
  return NextResponse.json({
    ok: true,
    message: "Se esse e-mail estiver cadastrado, enviamos um link de redefinição.",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return genericOk();
  }

  const { token, tokenHash } = generateResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const resetUrl = `${appUrl}/redefinir-senha?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return genericOk();
}
