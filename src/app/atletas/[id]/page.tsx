import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cardClass } from "@/lib/ui";

export const metadata = { title: "Perfil do atleta" };

function instagramUrl(handle: string) {
  if (handle.startsWith("http://") || handle.startsWith("https://")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export default async function AtletaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?from=/atletas/${id}`);
  if (session.sub === id) redirect("/perfil");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      course: true,
      institution: true,
      instagram: true,
      profileVisibleToMembers: true,
    },
  });

  if (!user || !user.profileVisibleToMembers) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className={cardClass}>
          <p className="text-sm text-muted">Esse perfil não está disponível.</p>
        </div>
      </div>
    );
  }

  const hasDetails = user.course || user.institution || user.instagram;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className={`${cardClass} space-y-3`}>
        <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
          {user.name}
        </h1>
        {hasDetails ? (
          <dl className="space-y-2 text-sm">
            {user.course && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Curso</dt>
                <dd>{user.course}</dd>
              </div>
            )}
            {user.institution && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Instituição
                </dt>
                <dd>{user.institution}</dd>
              </div>
            )}
            {user.instagram && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Instagram
                </dt>
                <dd>
                  <a
                    href={instagramUrl(user.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-soft"
                  >
                    {user.instagram}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted">Esse atleta ainda não preencheu essas informações.</p>
        )}
      </div>
    </div>
  );
}
