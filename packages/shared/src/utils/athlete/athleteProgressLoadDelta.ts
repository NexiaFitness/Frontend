/**
 * athleteProgressLoadDelta.ts — Carga comparable para el top de Mi progreso (B-35).
 * Contexto: max_weight es kg (externa, mixed o lastre). El ranking omite bodyweight.
 * Notas: P1.5 es primer vs último del periodo, sin umbral de caída. El 0.5 se
 * eliminó: en nexia no hay series external/mixed con caída a menos de la mitad.
 */

export function isBodyweightLoadType(
    tipoCarga: string | null | undefined
): boolean {
    return (tipoCarga ?? "").trim().toLowerCase() === "bodyweight";
}

/** Delta primer→último del periodo. Sin heurística de comparabilidad. */
export function periodLoadDelta(
    firstWeight: number | null | undefined,
    lastWeight: number | null | undefined
): number | null {
    if (firstWeight == null || lastWeight == null) return null;
    if (firstWeight <= 0 || lastWeight <= 0) return null;
    return Math.round((lastWeight - firstWeight) * 10) / 10;
}
