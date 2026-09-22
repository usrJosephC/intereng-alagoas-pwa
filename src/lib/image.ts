import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB — teto generoso pra rejeitar upload absurdo cedo

/**
 * Normaliza qualquer foto enviada (celular, câmera, arquivo) pra um quadrado
 * 512x512 em WebP — corrige a orientação EXIF da câmera e mantém cada foto
 * bem leve (~100-150KB), então o limite de storage nunca é um problema real.
 */
export async function processImageToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();
}
