/**
 * athleteProgressLoadDelta.ts — Carga comparable para el top de Mi progreso (B-35).
 * Contexto: max_weight es carga externa; bodyweight no entra en el ranking kg.
 * Notas: P1.5 sigue siendo primer vs último del periodo; una caída >50 % no es delta.
 */

export const COMPARABLE_LOAD_DROP_RATIO = 0.5;

export function isBodyweightLoadType(
    tipoCarga: string | null | undefined
): boolean {
    return (tipoCarga ?? "").trim().toLowerCase() === "bodyweight";
}

/** Delta primer→último. Caída a menos de la mitad → series no comparables. */
export function periodLoadDelta(
    firstWeight: number | null | undefined,
    lastWeight: number | null | undefined
): number | null {
    if (firstWeight == null || lastWeight == null) return null;
    if (firstWeight <= 0 || lastWeight <= 0) return null;
    if (
        lastWeight < firstWeight &&
        lastWeight / firstWeight < COMPARABLE_LOAD_DROP_RATIO
    ) {
        return null;
    }
    return Math.round((lastWeight - firstWeight) * 10) / 10;
}
