import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Redefinir senha" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Redefinir senha
      </h1>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        {token ? (
          <Suspense>
            <ResetPasswordForm token={token} />
          </Suspense>
        ) : (
          <p className="text-sm text-danger">
            Link inválido. Solicite uma nova redefinição de senha.
          </p>
        )}
      </div>
    </div>
  );
}
