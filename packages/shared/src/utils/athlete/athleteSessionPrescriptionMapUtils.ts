/**
 * athleteSessionPrescriptionMapUtils.ts — Copy del mapa V04 (redundancia cabecera ↔ bloque).
 */

/** Normaliza labels para comparar cualidad de cabecera vs nombre de bloque. */
export function normalizeAthleteSessionLabelForCompare(label: string): string {
    return label
        .trim()
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/\s+/g, " ");
}

/**
 * Muestra titular de bloque en «Tu sesión» cuando aporta (multi-bloque o distinto del H1).
 */
export function shouldShowPrescriptionBlockTitle(
    blockTitle: string,
    headerHeadline: string | null | undefined,
    blockCount: number
): boolean {
    if (blockCount > 1) return true;
    if (!headerHeadline?.trim()) return true;
    const a = normalizeAthleteSessionLabelForCompare(blockTitle);
    const b = normalizeAthleteSessionLabelForCompare(headerHeadline);
    return a !== b;
}
