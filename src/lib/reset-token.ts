import { randomBytes, createHash } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

/** Token de reset: valor em claro só existe no link do e-mail — o banco guarda
 * apenas o hash (mesmo princípio de nunca guardar senha em claro). */
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
