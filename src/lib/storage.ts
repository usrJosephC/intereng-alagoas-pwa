import { createClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

/**
 * Client server-side com a service role key (bypassa RLS) — o controle de quem
 * pode subir o quê é feito pelas próprias rotas (sessão/papel), igual ao resto
 * do app, que já acessa o Postgres direto via Prisma sem passar pelo RLS do Supabase.
 */
function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Sobe `buffer` pro bucket `uploads` no caminho informado (upsert: substitui o
 * que já existir nesse caminho, então um mesmo usuário/atlética nunca acumula
 * arquivos órfãos). Retorna a URL pública já com cache-bust — necessário porque
 * o caminho é sempre o mesmo, e sem isso o navegador/CDN poderia continuar
 * servindo a imagem antiga depois de uma reenvio.
 */
export async function uploadImage(path: string, buffer: Buffer): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error(
      "Upload de imagem não configurado (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes)."
    );
  }

  const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
