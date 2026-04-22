/**
 * Modelo puro: filas del panel de volumen semanal vs objetivo nominal (±10 % banda).
 * Sin React. Umbrales alineados con SPEC tracking carga semanal (Fase A / Fase B).
 */

import type { WeeklyMusclePlannedLoadRowOut } from "../types/sessionLoad";

export type WeeklyVolumeRowStatus = "deficit" | "on_target" | "excess" | "no_target";

export interface WeeklyVolumePanelRowModel {
    muscleGroupId: number;
    nameEs: string;
    accumulated: number;
    rangeMin: number | null;
    rangeMax: number | null;
    targetCenter: number | null;
    status: WeeklyVolumeRowStatus;
}

export function buildWeeklyVolumePanelRows(
    apiRows: WeeklyMusclePlannedLoadRowOut[],
    targetCenter: number | null
): WeeklyVolumePanelRowModel[] {
    return apiRows.map((r) => {
        const nameEs = r.name_es ?? "";
        const acc = r.planned_sets_sum;
        if (targetCenter == null) {
            return {
                muscleGroupId: r.muscle_group_id,
                nameEs,
                accumulated: acc,
                rangeMin: null,
                rangeMax: null,
                targetCenter: null,
                status: "no_target",
            };
        }
        const rangeMin = Math.max(1, Math.floor(targetCenter * 0.9));
        const rangeMax = Math.max(rangeMin, Math.ceil(targetCenter * 1.1));
        let status: WeeklyVolumeRowStatus;
        if (acc < rangeMin) {
            status = "deficit";
        } else if (acc > rangeMax) {
            status = "excess";
        } else {
            status = "on_target";
        }
        return {
            muscleGroupId: r.muscle_group_id,
            nameEs,
            accumulated: acc,
            rangeMin,
            rangeMax,
            targetCenter,
            status,
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
