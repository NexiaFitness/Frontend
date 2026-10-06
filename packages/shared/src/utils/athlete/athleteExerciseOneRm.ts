/**
 * athleteExerciseOneRm.ts — Copy and Epley helper for CTX-1 preview popup.
 */

import type { AthleteLastPerformance, AthleteOneRmKind } from "../../types/athleteLastPerformance";

export function computeEpley1RmKg(weightKg: number, reps: number): number | null {
    if (weightKg <= 0 || reps < 1 || reps > 10) return null;
    if (reps === 1) return Math.round(weightKg * 10) / 10;
    return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function formatOneRmLabel(kind: AthleteOneRmKind | null): string {
    if (kind === "recorded") return "1RM registrado";
    if (kind === "estimated") return "1RM estimado";
    return "1RM";
}

export function formatLastMarkLine(perf: AthleteLastPerformance): string | null {
    if (perf.weight_kg == null) return null;
    const weight =
        Number.isInteger(perf.weight_kg) ? `${perf.weight_kg} kg` : `${perf.weight_kg} kg`;
    if (perf.reps != null) {
        return `Última marca: ${weight} × ${perf.reps} reps`;
    }
    return `Última marca: ${weight}`;
}

export function formatOneRmValue(kg: number | null): string | null {
    if (kg == null || !Number.isFinite(kg)) return null;
    const rounded = Math.round(kg * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded} kg` : `${rounded} kg`;
}
