// Gera os ícones do PWA a partir do brasão oficial (public/brand/logo.png).
// Rode novamente com `node scripts/generate-icons.mjs` sempre que trocar a arte da logo.
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
mkdirSync(iconsDir, { recursive: true });

const logoPath = path.join(root, "public", "brand", "logo.png");
const NAVY = "#040b2b";

// Compõe o brasão (com transparência) sobre um fundo quadrado navy, ocupando
// `coverage` da largura do canvas — deixa respiro nas bordas e evita que o
// ícone pareça cortado em telas pequenas (favicon, apple-touch-icon).
async function composeIcon({ size, coverage }) {
  const logoWidth = Math.round(size * coverage);
  const logoBuffer = await sharp(logoPath)
    .resize({ width: logoWidth, withoutEnlargement: false })
    .toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: NAVY,
    },
  })
    .composite([
      {
        input: logoBuffer,
        left: Math.round((size - logoMeta.width) / 2),
        top: Math.round((size - logoMeta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

const targets = [
  { file: "icon-192.png", size: 192, coverage: 0.82 },
  { file: "icon-512.png", size: 512, coverage: 0.82 },
  // Maskable: OS recorta o ícone (círculo/squircle) fora da "safe zone" central,
  // por isso a logo ocupa uma fração menor do canvas aqui.
  { file: "icon-maskable-512.png", size: 512, coverage: 0.58 },
  { file: "apple-touch-icon.png", size: 180, coverage: 0.82 },
  { file: "favicon-32.png", size: 32, coverage: 0.86 },
];

for (const target of targets) {
  const buffer = await composeIcon(target);
  writeFileSync(path.join(iconsDir, target.file), buffer);
  console.log(`gerado: public/icons/${target.file}`);
}

// icon.svg: favicon escalável embutindo o brasão real (base64) sobre o fundo navy,
// na mesma composição do ícone 512 "any" — mantém um fallback vetorial funcional
// sem precisar re-traçar a arte à mão.
const svgLogoBuffer = await sharp(logoPath)
  .resize({ width: Math.round(512 * 0.82) })
  .png()
  .toBuffer();
const svgLogoMeta = await sharp(svgLogoBuffer).metadata();
const b64 = svgLogoBuffer.toString("base64");
const left = Math.round((512 - svgLogoMeta.width) / 2);
const top = Math.round((512 - svgLogoMeta.height) / 2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${NAVY}" />
  <image x="${left}" y="${top}" width="${svgLogoMeta.width}" height="${svgLogoMeta.height}" href="data:image/png;base64,${b64}" />
</svg>
`;
writeFileSync(path.join(iconsDir, "icon.svg"), svg);
console.log("gerado: public/icons/icon.svg");
