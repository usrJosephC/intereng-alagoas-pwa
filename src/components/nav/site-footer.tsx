// Marca pessoal "Cavalcante Tech" (mesma usada no portfólio meus-links) — SVG
// auto-contido (já tem seu próprio fundo/cores), por isso embutido direto aqui
// em vez de herdar currentColor como os outros ícones do site.
function CavalcanteTechMark() {
  return (
    <svg viewBox="0 0 64 64" width="18" height="18" role="img" aria-label="Cavalcante Tech">
      <rect width="64" height="64" rx="14" fill="#0d0d14" />
      <g transform="translate(32 32) scale(0.82) translate(-32 -32)">
        <path
          d="M38 13 H22 L12 23 V41 L22 51 H38"
          fill="none"
          stroke="#b794f6"
          strokeWidth="9"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <rect x="46" y="25.5" width="10" height="13" rx="2" fill="#b794f6" />
      </g>
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mb-16 flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-6 text-xs text-muted sm:mb-0 sm:flex-row sm:px-6">
      <p className="flex items-center gap-2">
        <CavalcanteTechMark />
        <span>
          Desenvolvido por{" "}
          <a
            href="https://usrjosephc.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold hover:text-gold-soft hover:underline"
          >
            Joseph Cavalcante
          </a>{" "}
          — Programador da{" "}
          <a
            href="https://vcldev.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold hover:text-gold-soft hover:underline"
          >
            Castro Corp
          </a>
        </span>
      </p>
      <p>
        © {year} InterEng Alagoas
      </p>
    </footer>
  );
}
