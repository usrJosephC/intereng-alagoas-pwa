import { prisma } from "@/lib/prisma";
import { VenuesManager } from "@/components/admin/venues-manager";

export const metadata = { title: "Locais" };

export default async function AdminVenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
        Locais
      </h1>
      <p className="mt-1 text-sm text-muted">
        Ginásios e quadras reutilizados no cadastro dos jogos.
      </p>
      <div className="mt-6">
        <VenuesManager initialVenues={venues} />
      </div>
    </div>
  );
}
