import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { teamEnrollSchema } from "@/lib/schemas";
import { SPORTS, CATEGORIES } from "@/lib/sports";
import type { Category, Sport } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = teamEnrollSchema.safeParse(body);
  const sport = body?.sport as Sport | undefined;
  const category = body?.category as Category | undefined;
  if (
    !parsed.success ||
    !sport ||
    !SPORTS.includes(sport) ||
    !category ||
    !CATEGORIES.includes(category)
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.team.findUnique({
    where: {
      atleticaId_sport_category: { atleticaId: parsed.data.atleticaId, sport, category },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Esta atlética já está inscrita neste esporte/categoria." },
      { status: 409 }
    );
  }

  const team = await prisma.team.create({
    data: { atleticaId: parsed.data.atleticaId, sport, category },
    include: { atletica: true },
  });

  return NextResponse.json({ team }, { status: 201 });
}
