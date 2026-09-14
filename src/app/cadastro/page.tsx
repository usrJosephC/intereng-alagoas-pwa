import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Cadastro" };

export default async function CadastroPage() {
  const atleticas = await prisma.atletica.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-muted">
        Cadastro simples para participar da comunidade do InterEng Alagoas.
      </p>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        <RegisterForm atleticas={atleticas} />
      </div>
      <p className="mt-4 text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-gold hover:text-gold-soft">
          Entrar
        </Link>
      </p>
    </div>
  );
}
