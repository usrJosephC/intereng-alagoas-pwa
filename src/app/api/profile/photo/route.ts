import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, processImageToWebp } from "@/lib/image";
import { uploadImage } from "@/lib/storage";

/** Foto do próprio usuário — sobe e já salva no banco na hora (diferente do
 * resto do perfil, que só persiste ao clicar em "Salvar alterações"). */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie um arquivo de imagem." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 15MB)." }, { status: 400 });
  }

  let webp: Buffer;
  try {
    webp = await processImageToWebp(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "Não foi possível processar a imagem." }, { status: 400 });
  }

  try {
    const avatarUrl = await uploadImage(`avatars/${session.sub}.webp`, webp);
    await prisma.user.update({ where: { id: session.sub }, data: { avatarUrl } });
    return NextResponse.json({ avatarUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Não foi possível enviar a foto." },
      { status: 500 }
    );
  }
}
