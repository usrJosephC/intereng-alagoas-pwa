import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { roleHomePath } from "@/lib/roles";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/auth/login"]);

/**
 * MASTER e ADMIN gerenciam usuários/papéis (a tela em si distingue o que cada
 * um pode fazer — ver src/lib/roles.ts). Só MASTER vê o log de auditoria.
 * ORGANIZADOR tem o resto do painel (times, sorteio, jogos, locais, atléticas,
 * comunidade) igual à diretoria. SUMULA só entra na tela de súmula.
 */
function isAllowed(pathname: string, role: Role): boolean {
  if (pathname.startsWith("/admin/auditoria") || pathname.startsWith("/api/admin/audit")) {
    return role === "MASTER";
  }
  if (pathname.startsWith("/admin/usuarios") || pathname.startsWith("/api/admin/users")) {
    return role === "MASTER" || role === "ADMIN";
  }
  if (pathname.startsWith("/admin/sumula") || pathname.startsWith("/api/sumula")) {
    return role === "MASTER" || role === "ADMIN" || role === "ORGANIZADOR" || role === "SUMULA";
  }
  return role === "MASTER" || role === "ADMIN" || role === "ORGANIZADOR";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowed(pathname, session.role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sem permissão para este recurso." }, { status: 403 });
    }
    return NextResponse.redirect(new URL(roleHomePath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
