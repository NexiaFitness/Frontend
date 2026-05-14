/**
 * Modelo puro: filas del panel de volumen semanal vs objetivo nominal (±10 % banda).
 * Sin React. Umbrales alineados con SPEC tracking carga semanal (Fase A / Fase B).
 */

export type WeeklyVolumeRowStatus = "deficit" | "on_target" | "excess" | "no_target";

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
}

export function buildWeeklyVolumePanelRows(
    apiRows: Array<{
        muscle_group_id: number;
        name_es: string;
        planned_sets_sum: number;
        direct_sets?: number;
        indirect_sets?: number;
        draft_sets?: number;
        daily_target?: number | null;
        accumulated_saved_without_session?: number;
        pattern_session_days?: number | null;
    }>,
    targetCenter: number | null
): WeeklyVolumePanelRowModel[] {
    return apiRows.map((r) => {
        const nameEs = r.name_es ?? "";
        const draftSets = r.draft_sets ?? 0;
        const targetToday = r.daily_target ?? null;
        const savedWeek =
            typeof r.accumulated_saved_without_session === "number"
                ? r.accumulated_saved_without_session
                : null;
        const patternSessionDays =
            typeof r.pattern_session_days === "number" && r.pattern_session_days > 0
                ? r.pattern_session_days
                : null;

        // MODO DIARIO: si tenemos targetToday valido
        if (targetToday != null && targetToday > 0) {
            const rangeMin = Math.max(1, Math.floor(targetToday * 0.9));
            const rangeMax = Math.max(rangeMin, Math.ceil(targetToday * 1.1));
            let status: WeeklyVolumeRowStatus;
            if (draftSets < rangeMin) status = "deficit";
            else if (draftSets > rangeMax) status = "excess";
            else status = "on_target";

            return {
                muscleGroupId: r.muscle_group_id,
                nameEs,
                accumulated: r.planned_sets_sum,
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
            };
        }

        // MODO SEMANAL (fallback)
        const acc = r.planned_sets_sum;
        if (targetCenter == null) {
            return {
                muscleGroupId: r.muscle_group_id,
                nameEs,
                accumulated: acc,
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
            };
        }
        const rangeMin = Math.max(1, Math.floor(targetCenter * 0.9));
        const rangeMax = Math.max(rangeMin, Math.ceil(targetCenter * 1.1));
        let status: WeeklyVolumeRowStatus;
        if (acc < rangeMin) status = "deficit";
        else if (acc > rangeMax) status = "excess";
        else status = "on_target";
        return {
            muscleGroupId: r.muscle_group_id,
            nameEs,
            accumulated: acc,
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
