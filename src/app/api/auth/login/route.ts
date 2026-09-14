import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

async function readCredentials(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  const form = await request.formData();
  return { email: form.get("email"), password: form.get("password") };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  const body = await readCredentials(request);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    if (isFormPost) {
      const redirectTo = new URL(request.headers.get("referer") ?? "/login", request.url);
      redirectTo.searchParams.set("error", "1");
      return NextResponse.redirect(redirectTo, 303);
    }
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const passwordOk = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    if (isFormPost) {
      const redirectTo = new URL(request.headers.get("referer") ?? "/login", request.url);
      redirectTo.searchParams.set("error", "1");
      return NextResponse.redirect(redirectTo, 303);
    }
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = isFormPost
    ? NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/", request.url), 303)
    : NextResponse.json({ ok: true, role: user.role });

  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
