/** Selo "AO VIVO" com um pontinho pulsante — só renderiza quando o jogo está
 * de fato ao vivo, então basta condicionar `status === "AO_VIVO"` no lugar de uso. */
export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger ${className}`}
    >
      <span className="live-dot h-2 w-2 rounded-full bg-danger" />
      Ao vivo
    </span>
  );
}
