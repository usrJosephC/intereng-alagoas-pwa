import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata = { title: "Usuários" };

export default async function AdminUsersPage() {
  const session = await getSession();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      birthDate: true,
      city: true,
      course: true,
      institution: true,
      sponsorConsent: true,
      createdAt: true,
      atletica: { select: { name: true } },
    },
  });

  const usersData = users.map((u) => ({
    ...u,
    birthDate: u.birthDate ? u.birthDate.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Usuários
      </h1>
      <p className="mt-1 text-sm text-muted">
        Gerencie o acesso da diretoria, organizadores e súmulas. Os dados de perfil (telefone,
        cidade, curso...) servem como lead de contato para patrocínio, quando o atleta autorizou.
      </p>
      <div className="mt-6">
        <UsersManager
          initialUsers={usersData}
          viewerRole={session?.role === "MASTER" ? "MASTER" : "ADMIN"}
          viewerId={session?.sub ?? ""}
        />
      </div>
    </div>
  );
}
