import { Resend } from "resend";

/**
 * `RESEND_API_KEY` ausente = ambiente sem e-mail configurado ainda (ex: dev
 * local sem a chave). Em vez de derrubar o fluxo de reset de senha, loga o
 * link no console — dá pra testar o fluxo inteiro sem depender do Resend.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY não configurada — link de reset pra ${to}: ${resetUrl}`
    );
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "InterEng Alagoas <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject: "Redefinição de senha — InterEng Alagoas",
    html: `
      <p>Recebemos um pedido para redefinir a senha da sua conta no InterEng Alagoas.</p>
      <p><a href="${resetUrl}">Clique aqui para escolher uma nova senha</a> (o link expira em 1 hora).</p>
      <p>Se você não pediu isso, pode ignorar este e-mail.</p>
    `,
  });
}
