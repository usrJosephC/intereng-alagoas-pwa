import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Entrar
      </h1>
      <p className="mt-1 text-sm text-muted">Acesse sua conta da comunidade InterEng Alagoas.</p>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-4 text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-gold hover:text-gold-soft">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
