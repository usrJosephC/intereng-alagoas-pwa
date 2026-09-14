import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { venueSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = venueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.venue.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um local com esse nome." }, { status: 409 });
  }

  const venue = await prisma.venue.create({
    data: { name: parsed.data.name, address: parsed.data.address || null },
  });

  return NextResponse.json({ venue }, { status: 201 });
}
