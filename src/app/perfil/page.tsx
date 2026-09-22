import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/perfil");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      phone: true,
      birthDate: true,
      city: true,
      course: true,
      institution: true,
      sponsorConsent: true,
      instagram: true,
      profileVisibleToMembers: true,
      atletica: { select: { name: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Meu perfil
      </h1>
      <p className="mt-1 text-sm text-muted">
        {user.email}
        {user.atletica ? ` · ${user.atletica.name}` : ""}
      </p>
      <div className="steel-border mt-6 rounded-sm bg-surface p-5">
        <ProfileForm
          user={{
            ...user,
            birthDate: user.birthDate ? user.birthDate.toISOString() : null,
          }}
        />
      </div>
    </div>
  );
}
