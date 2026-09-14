import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Acesso da diretoria" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Acesso da diretoria
      </h1>
      <p className="mt-1 text-sm text-muted">
        Área restrita à diretoria do InterEng Alagoas.
      </p>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        <Suspense>
          <LoginForm redirectAfter="/admin" />
        </Suspense>
      </div>
    </div>
  );
}
