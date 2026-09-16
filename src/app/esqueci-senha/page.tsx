import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Esqueci minha senha
      </h1>
      <p className="mt-1 text-sm text-muted">
        Informe o e-mail da sua conta e enviaremos um link para escolher uma nova senha.
      </p>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
