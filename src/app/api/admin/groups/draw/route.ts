import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupDrawSchema } from "@/lib/schemas";
import { SPORTS, CATEGORIES } from "@/lib/sports";
import { distribuirEmGrupos, nomeDoGrupo } from "@/lib/sorteio";
import type { Category, Sport } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sport = body?.sport as Sport | undefined;
  const category = body?.category as Category | undefined;
  const parsed = groupDrawSchema.safeParse(body);
  if (
    !parsed.success ||
    !sport ||
    !SPORTS.includes(sport) ||
    !category ||
    !CATEGORIES.includes(category)
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const teams = await prisma.team.findMany({ where: { sport, category }, select: { id: true } });
  if (teams.length < parsed.data.groupCount) {
    return NextResponse.json(
      { error: "Número de grupos maior que o número de times inscritos." },
      { status: 400 }
    );
  }

  const existingGroups = await prisma.group.findMany({
    where: { sport, category },
    select: { id: true },
  });

  try {
    await prisma.$transaction(async (tx) => {
      if (existingGroups.length > 0) {
        await tx.group.deleteMany({ where: { sport, category } });
      }

      const groupedTeams = distribuirEmGrupos(
        teams.map((t) => t.id),
        parsed.data.groupCount
      );

      for (let i = 0; i < groupedTeams.length; i++) {
        await tx.group.create({
          data: {
            sport,
            category,
            name: nomeDoGrupo(i),
            teams: {
              create: groupedTeams[i].map((teamId, order) => ({ teamId, order })),
            },
          },
        });
      }
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível re-sortear: já existem jogos cadastrados para os grupos atuais. Remova-os antes de sortear novamente.",
      },
      { status: 409 }
    );
  }

  const groups = await prisma.group.findMany({
    where: { sport, category },
    orderBy: { name: "asc" },
    include: {
      teams: { orderBy: { order: "asc" }, include: { team: { include: { atletica: true } } } },
    },
  });

  return NextResponse.json({ groups });
}
