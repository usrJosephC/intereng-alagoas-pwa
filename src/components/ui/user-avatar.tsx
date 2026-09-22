/** Avatar circular do usuário, com fallback pra inicial do nome quando não
 * há `avatarUrl` (mesmo padrão do logo da atlética, ver atletica-logo.tsx). */
export function UserAvatar({
  name,
  avatarUrl,
  className = "h-8 w-8",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária
      <img
        src={avatarUrl}
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
