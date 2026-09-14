// Todo o app trabalha em America/Maceio (mesmo fuso de São Paulo, UTC-3 fixo, sem
// horário de verão desde 2019) usando apenas Intl — sem dependência extra de tz.
const TIME_ZONE = "America/Maceio";

export function brazilTodayISODate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

export function brazilTodayRangeUTC(): { start: Date; end: Date } {
  const today = brazilTodayISODate();
  const start = new Date(`${today}T00:00:00-03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTimeBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Converte um valor de <input type="datetime-local"> (hora local de Alagoas) para Date/UTC. */
export function localInputToDate(value: string): Date {
  return new Date(`${value}:00-03:00`);
}

/** Formata um Date para o valor esperado por <input type="datetime-local"> em horário de Alagoas. */
export function dateToLocalInput(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
