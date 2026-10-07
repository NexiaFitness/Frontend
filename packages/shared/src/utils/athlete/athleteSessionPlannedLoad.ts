/**
 * athleteSessionPlannedLoad.ts — VOL/INT 1–10 for athlete agenda (bar fill, a11y).
 */

export interface AthleteSessionPlannedLoad {
    plannedVolume?: number | null;
    plannedIntensity?: number | null;
    planned_volume?: number | null;
    planned_intensity?: number | null;
}

export function readSessionPlannedLoad(
    session: AthleteSessionPlannedLoad
): { plannedVolume: number | null; plannedIntensity: number | null } {
    return {
        plannedVolume: session.plannedVolume ?? session.planned_volume ?? null,
        plannedIntensity: session.plannedIntensity ?? session.planned_intensity ?? null,
    };
}

export function normalizePlannedLoad1to10(
    value: number | null | undefined
): number | null {
    if (value == null || !Number.isFinite(value) || value <= 0) return null;
    return Math.min(10, Math.max(1, Math.round(value)));
}

export function hasAthleteSessionPlannedLoad(
    session: AthleteSessionPlannedLoad
): boolean {
    const load = readSessionPlannedLoad(session);
    return (
        normalizePlannedLoad1to10(load.plannedVolume) != null ||
        normalizePlannedLoad1to10(load.plannedIntensity) != null
    );
}

export function athletePlannedLoadAriaLabel(
    session: AthleteSessionPlannedLoad
): string | null {
    const load = readSessionPlannedLoad(session);
    const vol = normalizePlannedLoad1to10(load.plannedVolume);
    const int = normalizePlannedLoad1to10(load.plannedIntensity);
    if (vol == null && int == null) return null;
    const parts: string[] = [];
    if (vol != null) parts.push(`Volumen ${vol} de 10`);
    if (int != null) parts.push(`intensidad ${int} de 10`);
    return parts.join(", ");
}

export function formatAgendaMuscleGroupsLine(
    groups: string[] | null | undefined,
    maxVisible = 3
): string | null {
    if (!groups?.length) return null;
    const unique = [...new Set(groups.map((g) => g.trim()).filter(Boolean))];
    if (unique.length === 0) return null;
    const head = unique.slice(0, maxVisible);
    const rest = unique.length - head.length;
    if (rest > 0) {
        return `${head.join(" · ")} · +${rest}`;
    }
    return head.join(" · ");
}
