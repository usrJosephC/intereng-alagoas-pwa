import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  atleticaId: z.string().cuid().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  birthDate: z.string().trim().max(10).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  course: z.string().trim().max(80).optional().or(z.literal("")),
  institution: z.string().trim().max(120).optional().or(z.literal("")),
  /// Obrigatório: sem consentimento explícito não dá pra criar conta (ver o
  /// texto/checkbox no formulário de cadastro).
  sponsorConsent: z.literal(true, {
    error: "É preciso aceitar o compartilhamento de dados com o evento para se cadastrar.",
  }),
});

/// imageUrl só aceita o que veio do nosso próprio upload (POST /api/posts/photo)
/// — nunca uma URL externa arbitrária colada pelo usuário.
export const postCreateSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  imageUrl: z
    .string()
    .trim()
    .url()
    .max(2000)
    .refine((url) => url.includes("/storage/v1/object/public/uploads/posts/"), {
      error: "URL de imagem inválida.",
    })
    .optional()
    .or(z.literal("")),
});

export const commentCreateSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

/// logoUrl não entra aqui de propósito — é setado só via upload
/// (POST /api/admin/atleticas/[id]/logo), nunca por URL arbitrária no corpo.
export const atleticaSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shortName: z.string().trim().max(20).optional().or(z.literal("")),
});

export const venueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(200).optional().or(z.literal("")),
});

export const teamEnrollSchema = z.object({
  atleticaId: z.string().cuid(),
});

export const groupDrawSchema = z.object({
  groupCount: z.number().int().min(1).max(16),
  /// Cabeças de chave manuais (ex: 1º/2º colocados do campeonato anterior) —
  /// opcionais, vão pra posição 0 do Grupo A/B antes do resto ser sorteado.
  seedGroupA: z.string().cuid().optional().or(z.literal("")),
  seedGroupB: z.string().cuid().optional().or(z.literal("")),
});

export const matchCreateSchema = z.object({
  phase: z.enum(["GRUPOS", "QUARTAS", "SEMI", "TERCEIRO", "FINAL"]),
  groupId: z.string().cuid().optional().or(z.literal("")),
  teamAId: z.string().cuid(),
  teamBId: z.string().cuid(),
  venueId: z.string().cuid().optional().or(z.literal("")),
  matchDate: z.string().min(1),
  /// Confirma o cadastro mesmo com choque de horário detectado (ver checarChoqueHorario).
  forceConflict: z.boolean().optional(),
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(["MASTER", "ADMIN", "ORGANIZADOR", "SUMULA", "MEMBER"]),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["MASTER", "ADMIN", "ORGANIZADOR", "SUMULA", "MEMBER"]),
});

/// avatarUrl não entra aqui de propósito — é setado só via upload
/// (POST /api/profile/photo), nunca por URL arbitrária no corpo.
export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  birthDate: z.string().trim().max(10).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  course: z.string().trim().max(80).optional().or(z.literal("")),
  institution: z.string().trim().max(120).optional().or(z.literal("")),
  sponsorConsent: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(72),
});

export const matchUpdateSchema = z.object({
  scoreA: z.number().int().min(0).nullable().optional(),
  scoreB: z.number().int().min(0).nullable().optional(),
  status: z.enum(["AGENDADO", "AO_VIVO", "ENCERRADO", "ADIADO"]).optional(),
  matchDate: z.string().min(1).optional(),
  venueId: z.string().cuid().nullable().optional(),
  teamAId: z.string().cuid().optional(),
  teamBId: z.string().cuid().optional(),
  phase: z.enum(["GRUPOS", "QUARTAS", "SEMI", "TERCEIRO", "FINAL"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  /// Confirma o salvamento mesmo com choque de horário detectado (ver checarChoqueHorario).
  forceConflict: z.boolean().optional(),
});

/// Papel SUMULA só edita placar/status/observações — nunca times, local, data ou fase.
export const matchSumulaUpdateSchema = z.object({
  scoreA: z.number().int().min(0).nullable().optional(),
  scoreB: z.number().int().min(0).nullable().optional(),
  status: z.enum(["AGENDADO", "AO_VIVO", "ENCERRADO", "ADIADO"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});
