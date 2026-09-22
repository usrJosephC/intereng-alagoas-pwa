import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";
import { SPORT_LABELS, CATEGORY_LABELS, PHASE_LABELS, STATUS_LABELS } from "@/lib/sports";
import { formatDateTimeBR } from "@/lib/datetime";
import { CommentSection } from "@/components/comments/comment-section";
import { LiveBadge } from "@/components/ui/live-badge";
import { AtleticaLogo } from "@/components/ui/atletica-logo";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const session = await getSession();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  if (!match) notFound();

  const hasScore = match.scoreA !== null && match.scoreB !== null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <span>
          {SPORT_LABELS[match.sport]} {CATEGORY_LABELS[match.category]} · {PHASE_LABELS[match.phase]}
        </span>
        {match.status === "AO_VIVO" ? (
          <LiveBadge />
        ) : (
          <span>· {STATUS_LABELS[match.status]}</span>
        )}
      </p>

      <div className="steel-border mt-4 flex items-center justify-between gap-4 rounded-sm bg-surface p-5">
        <span className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <AtleticaLogo name={match.teamA.atletica.name} logoUrl={match.teamA.atletica.logoUrl} className="h-12 w-12" />
          <span className="font-heading text-lg font-semibold sm:text-xl">
            {match.teamA.atletica.name}
          </span>
        </span>
        <span className="shrink-0 font-heading text-2xl font-bold text-gold">
          {hasScore ? `${match.scoreA} — ${match.scoreB}` : "vs"}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <AtleticaLogo name={match.teamB.atletica.name} logoUrl={match.teamB.atletica.logoUrl} className="h-12 w-12" />
          <span className="font-heading text-lg font-semibold sm:text-xl">
            {match.teamB.atletica.name}
          </span>
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-muted">
        <p>{formatDateTimeBR(match.matchDate)}</p>
        <p>{match.venue?.name ?? "Local a definir"}</p>
        {match.venue?.address && <p className="text-xs">{match.venue.address}</p>}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted">
          Comentários da torcida
        </h2>
        <div className="mt-3">
          <CommentSection
            apiUrl={`/api/matches/${match.id}/comments`}
            initialComments={match.comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
            loggedIn={!!session}
            canModerate={!!session && canAccessAdmin(session.role)}
          />
        </div>
      </div>
    </div>
  );
}
