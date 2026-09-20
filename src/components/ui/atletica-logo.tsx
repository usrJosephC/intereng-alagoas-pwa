/** Avatar circular do logo da atlética, com fallback pra inicial do nome
 * quando não há `logoUrl` (mesmo padrão do avatar de perfil do usuário). */
export function AtleticaLogo({
  name,
  logoUrl,
  className = "h-8 w-8",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária
      <img
        src={logoUrl}
        alt=""
        className={`shrink-0 rounded-full border border-border object-cover ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-xs font-semibold text-muted ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
