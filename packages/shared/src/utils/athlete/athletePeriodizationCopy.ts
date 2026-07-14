/**
 * athletePeriodizationCopy.ts — Contexto de plan (dashboard V01).
 * Una línea amable, sin repetir objetivo ni porcentaje.
 */

export interface PeriodizationStripCopy {
    line: string;
}

export interface PeriodizationStripInput {
    planName: string | null;
    planGoal: string | null;
    planProgressPercent: number | null;
}

/** Quita sufijos tipo " — Diana" del nombre de plan para la UI. */
function cleanPlanDisplayName(planName: string): string {
    const trimmed = planName.trim();
    const dashIdx = trimmed.indexOf(" — ");
    if (dashIdx > 0) {
        return trimmed.slice(0, dashIdx).trim();
    }
    return trimmed;
}

export function buildPeriodizationStripCopy(
    input: PeriodizationStripInput
): PeriodizationStripCopy | null {
    if (!input.planName?.trim()) {
        return null;
    }

    const name = cleanPlanDisplayName(input.planName);
    return {
        line: `${name} · Sigue el ritmo`,
    };
}
