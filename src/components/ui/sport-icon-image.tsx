import type { Sport } from "@prisma/client";

const SPORT_ICON_SRC: Record<Sport, string> = {
  VOLEI: "/sports/volei.png",
  BASQUETE: "/sports/basquete.png",
  FUTSAL: "/sports/futsal.png",
  HANDEBOL: "/sports/handebol.png",
};

/**
 * Ícones fornecidos pelo usuário (icons8, preto sólido em PNG transparente).
 * Usa a técnica de mask-image em vez de <img> pra "tingir" o preto na cor da
 * marca via `currentColor` — assim herdam `text-gold` etc como os outros
 * ícones do site, em vez de ficarem pretos fixos (invisíveis no fundo navy).
 */
export function SportIconImage({ sport, className = "h-9 w-9" }: { sport: Sport; className?: string }) {
  const src = SPORT_ICON_SRC[sport];
  return (
    <span
      role="img"
      aria-label={sport}
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
