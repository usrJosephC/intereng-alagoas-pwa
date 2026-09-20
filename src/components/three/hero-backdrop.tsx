"use client";

import dynamic from "next/dynamic";

// Só baixa a cena (three.js) no cliente — o HTML inicial da home continua leve.
const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), { ssr: false });

/** Campo de partículas sutil atrás do brasão/hero da home — não compete com o
 * conteúdo, por isso fica só nessa seção (não é um fundo fixo de página toda). */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <HeroScene />
    </div>
  );
}
