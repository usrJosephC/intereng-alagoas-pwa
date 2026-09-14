import { prisma } from "@/lib/prisma";
import { AtleticasManager } from "@/components/admin/atleticas-manager";

export const metadata = { title: "Atléticas" };

export default async function AdminAtleticasPage() {
  const atleticas = await prisma.atletica.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortName: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Atléticas
      </h1>
      <p className="mt-1 text-sm text-muted">
        Cadastro central das atléticas. Inscreva cada uma nos esportes que vai disputar
        dentro da página de cada modalidade.
      </p>
      <div className="mt-6">
        <AtleticasManager initialAtleticas={atleticas} />
      </div>
    </div>
  );
}
