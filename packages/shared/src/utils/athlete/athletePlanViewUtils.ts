/**
 * athletePlanViewUtils.ts — Copy y formateo vista Mi plan (V08).
 */

import type {
    ClientTrainingPlanSummary,
    MonthlyTrainingProgress,
    TrainingPlanMonthlySummary,
} from "../../types/trainingAnalytics";

const MONTH_LABELS_SHORT = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
] as const;

export interface AthletePlanActiveBlockCopy {
    planTitle: string;
    monthLabel: string;
    weekLabel: string | null;
    adherencePercent: number;
    coherencePercent: number | null;
    volumeLevel: number;
    intensityLevel: number;
}

export interface AthletePlanMonthTimelineItem {
    month: number;
    label: string;
    volumeLevel: number;
    intensityLevel: number;
    isCurrent: boolean;
}

/** Quita sufijos « — Nombre» del título de plan. */
export function cleanAthletePlanDisplayName(planName: string | null | undefined): string {
    if (!planName?.trim()) return "Mi plan de entrenamiento";
    const trimmed = planName.trim();
    const dashIdx = trimmed.indexOf(" — ");
    if (dashIdx > 0) return trimmed.slice(0, dashIdx).trim();
    return trimmed;
}

/** Escala 1–10 legible; 0 = sin dato de periodización. */
export function formatAthleteLoadLevel(level: number): string {
    if (!Number.isFinite(level) || level <= 0) return "Sin dato";
    return `${Math.round(level)}/10`;
}

export function formatAthletePercent(value: number): string {
    if (!Number.isFinite(value)) return "0%";
    return `${Math.round(value)}%`;
}

export function resolveAthletePlanWeekLabel(
    monthly: TrainingPlanMonthlySummary | undefined,
    reference = new Date()
): string | null {
    if (!monthly?.weeks?.length) return null;
    const day = reference.getDate();
    const weekIndex = Math.min(Math.ceil(day / 7), monthly.weeks.length) - 1;
    const weekNumber = monthly.weeks[weekIndex]?.week ?? weekIndex + 1;
    return `Semana ${weekNumber} de ${monthly.weeks.length}`;
}

export function buildAthletePlanActiveBlockCopy(
    summary: ClientTrainingPlanSummary,
    monthly: TrainingPlanMonthlySummary | undefined,
    reference = new Date()
): AthletePlanActiveBlockCopy {
    const month = reference.getMonth() + 1;
    const monthProgress = summary.yearly_progression.find((m) => m.month === month);
    const loadSource = monthly?.training_load ?? summary.training_load;

    return {
        planTitle: cleanAthletePlanDisplayName(summary.plan_name),
        monthLabel: reference.toLocaleDateString("es-ES", { month: "long" }),
        weekLabel: resolveAthletePlanWeekLabel(monthly, reference),
        adherencePercent: summary.summary.adherence_rate ?? 0,
        coherencePercent:
            monthly?.plan_alignment != null ? Math.round(monthly.plan_alignment) : null,
        volumeLevel: loadSource.volume_level ?? monthProgress?.volume_level ?? 0,
        intensityLevel: loadSource.intensity_level ?? monthProgress?.intensity_level ?? 0,
    };
}

export function buildAthletePlanMonthTimeline(
    progression: MonthlyTrainingProgress[],
    reference = new Date()
): AthletePlanMonthTimelineItem[] {
    const currentMonth = reference.getMonth() + 1;
    return progression.map((item) => ({
        month: item.month,
        label: MONTH_LABELS_SHORT[item.month - 1] ?? String(item.month),
        volumeLevel: item.volume_level,
        intensityLevel: item.intensity_level,
        isCurrent: item.month === currentMonth,
    }));
}

export function athleteLoadBarPercent(level: number, max = 10): number {
    if (!Number.isFinite(level) || level <= 0) return 0;
    return Math.min(100, Math.round((level / max) * 100));
}
