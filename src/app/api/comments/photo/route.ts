import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, processImageForPost } from "@/lib/image";
import { uploadImage } from "@/lib/storage";

/** Foto anexada a um comentário (de post ou de jogo — mesmo modelo Comment).
 * Sobe pra um caminho único por envio e só retorna a URL; o comentário em
 * si só é criado no POST de /api/posts/[id]/comments ou /api/matches/[id]/comments. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para comentar." }, { status: 401 });
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
    webp = await processImageForPost(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "Não foi possível processar a imagem." }, { status: 400 });
  }

  try {
    const imageUrl = await uploadImage(
      `comments/${session.sub}/${crypto.randomUUID()}.webp`,
      webp
    );
    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Não foi possível enviar a imagem." },
      { status: 500 }
    );
  }
}
