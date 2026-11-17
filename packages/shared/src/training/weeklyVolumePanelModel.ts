/**
 * Modelo puro: filas del panel de volumen.
 * En el constructor (session_draft) la cifra, la barra y el estado son series
 * directas de hoy / objetivo de hoy. La semana solo entra como aviso.
 * Archivo por encima de 400 líneas: el aviso y el reparto directo/apoyo viven
 * aquí para no abrir otro módulo de la misma regla.
 */

import { formatSetVolume } from "./volumeDisplay";

export type WeeklyVolumeRowStatus = "deficit" | "on_target" | "excess" | "no_target";

/** Banda ±10 % sobre el objetivo diario (constructor y validación de sesión). */
export const DAILY_VOLUME_TARGET_BAND = 0.1;

export type VolumeRatioHoyStyle = "constructor" | "session_review";

/** Constructor create vs edit — controla fuente de datos del panel. */
export type WeeklyClientVolumePanelIntent = "create_session" | "edit_session";

/**
 * session_draft: numerador y desglose solo de esta sesión (draft_sets).
 * weekly_saved: acumulado semanal guardado (GET weekly-by-muscle).
 */
export type WeeklyVolumePanelDataScope = "session_draft" | "weekly_saved";

export interface WeeklyVolumePanelApiRowInput {
    muscle_group_id: number;
    name_es: string;
    planned_sets_sum: number;
    direct_sets?: number;
    indirect_sets?: number;
    draft_sets?: number;
    daily_target?: number | null;
    accumulated_saved_without_session?: number;
    pattern_session_days?: number | null;
    structure_weekdays?: number[];
    data_scope: WeeklyVolumePanelDataScope;
}

export interface VolumeWeekAlert {
    kind: "complete" | "last_day_short";
    /** Series efectivas que faltan para el objetivo semanal. Null si la semana ya está cubierta. */
    remaining: number | null;
}

/**
 * Aviso de semana. La fila sigue midiendo el directo de hoy; aquí el efectivo
 * (directo + indirecto, guardado + hoy) decide el aviso.
 * Sin weekdays no hay aviso de último día: el campo es aditivo.
 */
export function resolveWeekAlert(
    effectiveSets: number,
    weeklyTarget: number | null,
    sessionWeekday: number | null,
    structureWeekdays: number[] | null | undefined,
): VolumeWeekAlert | null {
    if (weeklyTarget == null || weeklyTarget <= 0) return null;
    if (effectiveSets >= weeklyTarget) {
        return { kind: "complete", remaining: null };
    }
    if (sessionWeekday == null || !structureWeekdays || structureWeekdays.length === 0) {
        return null;
    }
    const hasLaterDay = structureWeekdays.some((day) => day > sessionWeekday);
    if (!hasLaterDay) {
        return { kind: "last_day_short", remaining: weeklyTarget - effectiveSets };
    }
    return null;
}

export function resolveDailyVolumeBand(targetToday: number): {
    rangeMin: number;
    rangeMax: number;
} {
    const rangeMin = Math.max(1, Math.floor(targetToday * (1 - DAILY_VOLUME_TARGET_BAND)));
    const rangeMax = Math.max(rangeMin, Math.ceil(targetToday * (1 + DAILY_VOLUME_TARGET_BAND)));
    return { rangeMin, rangeMax };
}

export function resolveDailyVolumeStatus(
    actualSets: number,
    targetToday: number | null
): WeeklyVolumeRowStatus {
    if (targetToday == null || targetToday <= 0) return "no_target";
    const { rangeMin, rangeMax } = resolveDailyVolumeBand(targetToday);
    if (actualSets < rangeMin) return "deficit";
    if (actualSets > rangeMax) return "excess";
    return "on_target";
}

export function volumeStatusLabel(status: WeeklyVolumeRowStatus): string {
    switch (status) {
        case "deficit":
            return "Déficit";
        case "on_target":
            return "En rango";
        case "excess":
            return "Exceso";
        default:
            return "Sin objetivo";
    }
}

export function volumeStatusDotClass(status: WeeklyVolumeRowStatus): string {
    switch (status) {
        case "deficit":
            return "text-amber-500";
        case "on_target":
            return "text-emerald-500";
        case "excess":
            return "text-rose-500";
        default:
            return "text-muted-foreground";
    }
}

export function volumeStatusBarColorClass(status: WeeklyVolumeRowStatus): string {
    switch (status) {
        case "deficit":
            return "bg-amber-500/90";
        case "on_target":
            return "bg-emerald-500/90";
        case "excess":
            return "bg-rose-500/90";
        default:
            return "bg-muted-foreground/40";
    }
}

export function volumeBarWidthPct(row: WeeklyVolumePanelRowModel): number {
    if (row.status === "no_target") {
        const cap = Math.max(row.draftSets, 10);
        return Math.min(100, (row.draftSets / cap) * 100);
    }
    if (
        row.dataScope === "session_draft" &&
        row.targetToday != null &&
        row.targetToday > 0
    ) {
        const direct = row.directSets ?? row.draftSets;
        return Math.min(100, (direct / row.targetToday) * 100);
    }
    if (row.targetToday != null && row.targetToday > 0) {
        return Math.min(100, (row.draftSets / row.targetToday) * 100);
    }
    if (row.rangeMax != null && row.rangeMax > 0) {
        return Math.min(100, (row.accumulated / row.rangeMax) * 100);
    }
    return 0;
}

export type VolumeRatioParts = {
    primary: string;
    hoySupport: string | null;
};

function formatVolumeRatioHoyFallback(
    row: Pick<
        WeeklyVolumePanelRowModel,
        "draftSets" | "targetToday" | "accumulated" | "rangeMax" | "targetCenter" | "dataScope"
    >
): string {
    if (row.targetToday != null && row.targetToday > 0) {
        const base = `${formatSetVolume(row.draftSets)} / ${row.targetToday}`;
        return `${base} programadas · hoy`;
    }
    if (row.rangeMax != null && row.rangeMax > 0 && row.targetCenter != null) {
        const numerator = row.dataScope === "session_draft" ? row.draftSets : row.accumulated;
        const unit = row.dataScope === "session_draft" ? "esta sesión" : "semana";
        return `${formatSetVolume(numerator)} / ${row.targetCenter} programadas · ${unit}`;
    }
    const fallbackTotal = row.dataScope === "session_draft" ? row.draftSets : row.accumulated;
    return `${formatSetVolume(fallbackTotal)} programadas`;
}

/**
 * Constructor: series directas de hoy / objetivo de hoy.
 * Consulta semanal (sin borrador): el acumulado, porque esa pantalla es la semana.
 */
export function formatVolumeWeekPrimaryAndHoy(
    row: Pick<
        WeeklyVolumePanelRowModel,
        | "draftSets"
        | "targetToday"
        | "accumulated"
        | "rangeMax"
        | "targetCenter"
        | "dataScope"
        | "savedWeekWithoutSession"
        | "directSets"
    >,
    _style: VolumeRatioHoyStyle = "constructor"
): VolumeRatioParts {
    if (row.dataScope === "session_draft" && row.targetToday != null && row.targetToday > 0) {
        const direct = row.directSets ?? row.draftSets;
        return {
            primary: `${formatSetVolume(direct)}/${row.targetToday}`,
            hoySupport: null,
        };
    }
    if (typeof row.savedWeekWithoutSession === "number") {
        const weekTotal = row.savedWeekWithoutSession + row.draftSets;
        const primary =
            row.targetCenter != null && row.targetCenter > 0
                ? `${formatSetVolume(weekTotal)} / ${row.targetCenter} semana`
                : `${formatSetVolume(weekTotal)} semana`;
        return {
            primary,
            hoySupport: `+${formatSetVolume(row.draftSets)} hoy`,
        };
    }
    return { primary: formatVolumeRatioHoyFallback(row), hoySupport: null };
}

export function formatVolumeRatioHoy(
    row: Pick<
        WeeklyVolumePanelRowModel,
        | "draftSets"
        | "targetToday"
        | "accumulated"
        | "rangeMax"
        | "targetCenter"
        | "dataScope"
        | "savedWeekWithoutSession"
    >,
    style: VolumeRatioHoyStyle = "constructor"
): string {
    const { primary, hoySupport } = formatVolumeWeekPrimaryAndHoy(row, style);
    return hoySupport ? `${primary} ${hoySupport}` : primary;
}

/** Mapea fila validate-draft a input del panel (hoy + acumulado semanal B6 #7). */
export function mapSessionLoadDraftRowToPanelInput(row: {
    muscle_group_id: number;
    name_es: string;
    draft_sets: number;
    draft_direct?: number;
    draft_indirect?: number;
    daily_target: number;
    pattern_session_days?: number;
    accumulated_saved_without_session?: number;
    structure_weekdays?: number[];
}): WeeklyVolumePanelApiRowInput {
    const draftSets = row.draft_sets ?? 0;
    return {
        muscle_group_id: row.muscle_group_id,
        name_es: row.name_es,
        planned_sets_sum: draftSets,
        direct_sets: row.draft_direct ?? 0,
        indirect_sets: row.draft_indirect ?? 0,
        draft_sets: draftSets,
        daily_target: row.daily_target,
        pattern_session_days: row.pattern_session_days,
        accumulated_saved_without_session: row.accumulated_saved_without_session,
        structure_weekdays: row.structure_weekdays ?? [],
        data_scope: "session_draft",
    };
}

/** Mapea fila GET weekly-by-muscle (sesiones ya guardadas en la semana). */
export function mapWeeklySavedRowToPanelInput(row: {
    muscle_group_id: number;
    name_es: string;
    planned_sets_sum: number;
    direct_sets?: number;
    indirect_sets?: number;
}): WeeklyVolumePanelApiRowInput {
    return {
        muscle_group_id: row.muscle_group_id,
        name_es: row.name_es,
        planned_sets_sum: row.planned_sets_sum,
        direct_sets: row.direct_sets,
        indirect_sets: row.indirect_sets,
        draft_sets: 0,
        data_scope: "weekly_saved",
    };
}

/** Mapea fila de validación de sesión (V1) al modelo del panel de volumen. */
export function volumeMuscleValidationToPanelRow(mg: {
    muscle_group_id: number;
    name_es: string;
    weekly_target: number;
    daily_expected: number;
    actual_sets: number;
    direct_sets?: number;
    indirect_sets?: number;
}): WeeklyVolumePanelRowModel {
    const targetToday = mg.daily_expected > 0 ? mg.daily_expected : null;
    const draftSets = mg.actual_sets;
    const status = resolveDailyVolumeStatus(draftSets, targetToday);
    const band =
        targetToday != null && targetToday > 0 ? resolveDailyVolumeBand(targetToday) : null;

    return {
        muscleGroupId: mg.muscle_group_id,
        nameEs: mg.name_es?.trim() || "",
        accumulated: draftSets,
        savedWeekWithoutSession: null,
        directSets: mg.direct_sets ?? 0,
        indirectSets: mg.indirect_sets ?? 0,
        draftSets,
        targetToday,
        rangeMin: band?.rangeMin ?? null,
        rangeMax: band?.rangeMax ?? null,
        targetCenter: mg.weekly_target > 0 ? mg.weekly_target : null,
        status,
        patternSessionDays: null,
        structureWeekdays: [],
        weekAlert: null,
        dataScope: "session_draft",
    };
}

export interface WeeklyVolumePanelRowModel {
    muscleGroupId: number;
    nameEs: string;
    accumulated: number;
    /**
     * Sets ya guardados esta semana sin contar esta sesión (Fase B),
     * solo cuando el backend lo envía; sirve para no confundir con el objetivo semanal total.
     */
    savedWeekWithoutSession: number | null;
    /** Decisión D1: sets directos (prime_mover) */
    directSets?: number;
    /** Decisión D1: sets indirectos (synergist) */
    indirectSets?: number;
    draftSets: number;
    targetToday: number | null;
    rangeMin: number | null;
    rangeMax: number | null;
    targetCenter: number | null;
    status: WeeklyVolumeRowStatus;
    /**
     * Sesiones semanales con este patrón para el grupo (validate-draft); null si no aplica o no llegó del API.
     */
    patternSessionDays: number | null;
    /** Días 1-7 de esta semana en los que la estructura toca el músculo. Vacío si el API no lo manda. */
    structureWeekdays: number[];
    /** Solo session_draft. La barra no cambia de color por este aviso. */
    weekAlert: VolumeWeekAlert | null;
    dataScope: WeeklyVolumePanelDataScope;
}

export function buildWeeklyVolumePanelRows(
    apiRows: WeeklyVolumePanelApiRowInput[],
    targetCenter: number | null,
    sessionWeekday: number | null = null,
): WeeklyVolumePanelRowModel[] {
    return apiRows.map((r) => {
        const nameEs = r.name_es ?? "";
        const draftSets = r.draft_sets ?? 0;
        const dataScope = r.data_scope;
        const targetToday = r.daily_target ?? null;
        const savedWeek =
            typeof r.accumulated_saved_without_session === "number"
                ? r.accumulated_saved_without_session
                : null;
        const patternSessionDays =
            typeof r.pattern_session_days === "number" && r.pattern_session_days > 0
                ? r.pattern_session_days
                : null;
        const structureWeekdays = r.structure_weekdays ?? [];
        const displayTotal =
            dataScope === "session_draft" ? draftSets : r.planned_sets_sum;
        const scoredSets =
            dataScope === "session_draft" ? (r.direct_sets ?? draftSets) : draftSets;
        const effectiveSets =
            (savedWeek ?? 0) + (dataScope === "session_draft" ? draftSets : 0);
        const weekAlert =
            dataScope === "session_draft"
                ? resolveWeekAlert(
                      effectiveSets,
                      targetCenter,
                      sessionWeekday,
                      structureWeekdays,
                  )
                : null;

        // MODO DIARIO: si tenemos targetToday valido
        if (targetToday != null && targetToday > 0) {
            const { rangeMin, rangeMax } = resolveDailyVolumeBand(targetToday);
            const status = resolveDailyVolumeStatus(scoredSets, targetToday);

            return {
                muscleGroupId: r.muscle_group_id,
                nameEs,
                accumulated: displayTotal,
                savedWeekWithoutSession: savedWeek,
                directSets: r.direct_sets,
                indirectSets: r.indirect_sets,
                draftSets,
                targetToday,
                rangeMin,
                rangeMax,
                targetCenter,
                status,
                patternSessionDays,
                structureWeekdays,
                weekAlert,
                dataScope,
            };
        }

        // MODO SEMANAL (fallback sin daily_target del bloque)
        const weeklyNumerator =
            dataScope === "session_draft" ? draftSets : r.planned_sets_sum;
        if (targetCenter == null) {
            return {
                muscleGroupId: r.muscle_group_id,
                nameEs,
                accumulated: displayTotal,
                savedWeekWithoutSession: savedWeek,
                directSets: r.direct_sets,
                indirectSets: r.indirect_sets,
                draftSets,
                targetToday: null,
                rangeMin: null,
                rangeMax: null,
                targetCenter: null,
                status: "no_target",
                patternSessionDays,
                structureWeekdays,
                weekAlert,
                dataScope,
            };
        }
        const rangeMin = Math.max(1, Math.floor(targetCenter * 0.9));
        const rangeMax = Math.max(rangeMin, Math.ceil(targetCenter * 1.1));
        let status: WeeklyVolumeRowStatus;
        if (weeklyNumerator < rangeMin) status = "deficit";
        else if (weeklyNumerator > rangeMax) status = "excess";
        else status = "on_target";
        return {
            muscleGroupId: r.muscle_group_id,
            nameEs,
            accumulated: displayTotal,
            savedWeekWithoutSession: savedWeek,
            directSets: r.direct_sets,
            indirectSets: r.indirect_sets,
            draftSets,
            targetToday: null,
            rangeMin,
            rangeMax,
            targetCenter,
            status,
            patternSessionDays,
            structureWeekdays,
            weekAlert,
            dataScope,
        };
    });
}

export interface WeeklyVolumeSummaryCounts {
    deficit: number;
    on_target: number;
    excess: number;
    no_target: number;
}

export function summarizeVolumeRowStatuses(rows: WeeklyVolumePanelRowModel[]): WeeklyVolumeSummaryCounts {
    return {
        deficit: rows.filter((r) => r.status === "deficit").length,
        on_target: rows.filter((r) => r.status === "on_target").length,
        excess: rows.filter((r) => r.status === "excess").length,
        no_target: rows.filter((r) => r.status === "no_target").length,
    };
}

/** Delta vs semana anterior (solo volumen planificado acumulado). */
export function formatPriorWeekDelta(
    currentTotal: number,
    priorTotal: number | null | undefined
): string | null {
    if (priorTotal == null) {
        return null;
    }
    const delta = currentTotal - priorTotal;
    if (delta === 0) {
        return "= sem. ant.";
    }
    const sign = delta > 0 ? "+" : "";
    return `${sign}${formatSetVolume(delta)} vs sem. ant.`;
}

export function priorWeekTotalByMuscle(
    priorRows: Array<{ muscle_group_id: number; planned_sets_sum: number }> | undefined,
    muscleGroupId: number
): number | null {
    if (!priorRows?.length) {
        return null;
    }
    const row = priorRows.find((r) => r.muscle_group_id === muscleGroupId);
    return row ? row.planned_sets_sum : 0;
}
