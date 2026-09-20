// Gera public/textures/grunge-navy.webp a partir de public/textures/grunge.webp.
// Rode de novo com `node scripts/tint-texture.mjs` se trocar a textura base
// ou quiser ajustar o tom do tingimento usado no fundo do app (src/app/globals.css).
import sharp from "sharp";

const src = "public/textures/grunge.webp";
const out = "public/textures/grunge-navy.webp";

// tint() preserva o contraste/luminância do grão original (ao contrário de
// multiply, que esmagava tudo pra preto contra um fundo já escuro).
await sharp(src)
  .tint({ r: 22, g: 38, b: 92 })
  .modulate({ brightness: 0.4 })
  .webp({ quality: 60 })
  .toFile(out);

console.log("gerado:", out);
