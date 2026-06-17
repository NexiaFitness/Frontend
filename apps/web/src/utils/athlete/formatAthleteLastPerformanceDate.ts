/**
 * formatAthleteLastPerformanceDate.ts — Fecha corta para hint run atleta.
 */

export function formatAthleteLastPerformanceDate(isoDate: string): string {
    const parsed = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
