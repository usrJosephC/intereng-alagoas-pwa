import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES, processImageToWebp } from "@/lib/image";
import { uploadImage } from "@/lib/storage";

/** Logo da atlética — protegida pelo src/proxy.ts (MASTER/ADMIN/ORGANIZADOR),
 * igual ao resto de /api/admin. Sobe e já salva no banco na hora. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    const logoUrl = await uploadImage(`logos/${id}.webp`, webp);
    const atletica = await prisma.atletica.update({ where: { id }, data: { logoUrl } });
    return NextResponse.json({ atletica });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Não foi possível enviar o logo." },
      { status: 500 }
    );
  }
}
