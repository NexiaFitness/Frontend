/**
 * Modelo puro: filas del panel de volumen semanal vs objetivo nominal (±10 % banda).
 * Sin React. Umbrales alineados con SPEC tracking carga semanal (Fase A / Fase B).
 */

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
    data_scope: WeeklyVolumePanelDataScope;
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
    if (row.targetToday != null && row.targetToday > 0) {
        return Math.min(100, (row.draftSets / row.targetToday) * 100);
    }
    if (row.rangeMax != null && row.rangeMax > 0) {
        return Math.min(100, (row.accumulated / row.rangeMax) * 100);
    }
    return 0;
}

export function formatVolumeRatioHoy(
    row: Pick<
        WeeklyVolumePanelRowModel,
        "draftSets" | "targetToday" | "accumulated" | "rangeMax" | "targetCenter" | "dataScope"
    >,
    style: VolumeRatioHoyStyle = "constructor"
): string {
    if (row.targetToday != null && row.targetToday > 0) {
        const base = `${row.draftSets} / ${row.targetToday}`;
        return style === "session_review" ? `${base} series hoy` : `${base} hoy`;
    }
    if (row.rangeMax != null && row.rangeMax > 0 && row.targetCenter != null) {
        const numerator = row.dataScope === "session_draft" ? row.draftSets : row.accumulated;
        const unit = row.dataScope === "session_draft" ? "esta sesión" : "semana";
        return `${numerator} / ${row.targetCenter} ${unit}`;
    }
    const fallbackTotal = row.dataScope === "session_draft" ? row.draftSets : row.accumulated;
    return `${fallbackTotal} series`;
}

/** Mapea fila validate-draft a input del panel: solo volumen de esta sesión. */
export function mapSessionLoadDraftRowToPanelInput(row: {
    muscle_group_id: number;
    name_es: string;
    draft_sets: number;
    draft_direct?: number;
    draft_indirect?: number;
    daily_target: number;
    pattern_session_days?: number;
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
        draftSets,
        targetToday,
        rangeMin: band?.rangeMin ?? null,
        rangeMax: band?.rangeMax ?? null,
        targetCenter: mg.weekly_target > 0 ? mg.weekly_target : null,
        status,
        patternSessionDays: null,
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
    dataScope: WeeklyVolumePanelDataScope;
}

export function buildWeeklyVolumePanelRows(
    apiRows: WeeklyVolumePanelApiRowInput[],
    targetCenter: number | null
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
        const displayTotal =
            dataScope === "session_draft" ? draftSets : r.planned_sets_sum;

        // MODO DIARIO: si tenemos targetToday valido
        if (targetToday != null && targetToday > 0) {
            const { rangeMin, rangeMax } = resolveDailyVolumeBand(targetToday);
            const status = resolveDailyVolumeStatus(draftSets, targetToday);

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
