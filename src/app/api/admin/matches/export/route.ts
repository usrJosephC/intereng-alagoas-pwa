import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { SPORT_LABELS, CATEGORY_LABELS, PHASE_LABELS, STATUS_LABELS } from "@/lib/sports";
import { formatDateBR, formatTimeBR } from "@/lib/datetime";

/**
 * Exporta a agenda inteira (todos os esportes/categorias) em .xlsx pra
 * organização conferir na planilha se algum horário se choca — por isso não
 * filtra por esporte/categoria, o ponto é ver tudo junto numa lista só.
 */
export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { matchDate: "asc" },
    include: {
      teamA: { include: { atletica: true } },
      teamB: { include: { atletica: true } },
      venue: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Agenda de jogos");

  sheet.columns = [
    { header: "Data", key: "data", width: 12 },
    { header: "Hora", key: "hora", width: 8 },
    { header: "Esporte", key: "esporte", width: 14 },
    { header: "Categoria", key: "categoria", width: 12 },
    { header: "Fase", key: "fase", width: 18 },
    { header: "Time A", key: "timeA", width: 26 },
    { header: "Time B", key: "timeB", width: 26 },
    { header: "Local", key: "local", width: 22 },
    { header: "Status", key: "status", width: 12 },
    { header: "Placar A", key: "placarA", width: 10 },
    { header: "Placar B", key: "placarB", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const match of matches) {
    sheet.addRow({
      data: formatDateBR(match.matchDate),
      hora: formatTimeBR(match.matchDate),
      esporte: SPORT_LABELS[match.sport],
      categoria: CATEGORY_LABELS[match.category],
      fase: PHASE_LABELS[match.phase],
      timeA: match.teamA.atletica.name,
      timeB: match.teamB.atletica.name,
      local: match.venue?.name ?? "A definir",
      status: STATUS_LABELS[match.status],
      placarA: match.scoreA ?? "",
      placarB: match.scoreB ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `agenda-interengalagoas-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
