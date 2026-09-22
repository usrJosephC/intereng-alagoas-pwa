import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB — teto generoso pra rejeitar upload absurdo cedo

/**
 * Normaliza qualquer foto enviada (celular, câmera, arquivo) pra um quadrado
 * 512x512 em WebP — corrige a orientação EXIF da câmera e mantém cada foto
 * bem leve (~100-150KB), então o limite de storage nunca é um problema real.
 * Usado pra foto de perfil e logo de atlética, que sempre aparecem num slot
 * quadrado/circular fixo na UI.
 */
export async function processImageToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * Mesma ideia, mas sem forçar quadrado — pra foto de post do mural, que é
 * exibida em largura variável (a UI já corta com object-cover no CSS). Só
 * limita o maior lado a 1280px, sem aumentar imagem menor que isso.
 */
export async function processImageForPost(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
