/**
 * athleteSessionPreviewUtils.ts — Copy preview V04 por tipo de grupo.
 */

import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";

export interface AthletePreviewGroupRow {
    key: string;
    title: string;
    detail: string;
    exerciseIds: number[];
    hasCompoundLayout: boolean;
}

function joinExerciseNames(group: SessionExerciseGroupView): string {
    return group.slots.map((s) => s.exerciseName).join(" + ");
}

/** Una fila de preview por grupo (superset = 1 fila, single = 1 fila por slot). */
export function buildAthletePreviewGroupRows(
    group: SessionExerciseGroupView
): AthletePreviewGroupRow[] {
    const exerciseIds = group.slots.map((s) => s.exerciseId);

    switch (group.kind) {
        case "superset":
        case "giant_set":
            return [
                {
                    key: group.groupId,
                    title: group.badgeLabel,
                    detail: `${joinExerciseNames(group)} · ${group.rounds ?? "?"} rondas`,
                    exerciseIds,
                    hasCompoundLayout: true,
                },
            ];
        case "dropset": {
            const name = group.slots[0]?.exerciseName ?? "Ejercicio";
            return [
                {
                    key: group.groupId,
                    title: group.badgeLabel,
                    detail: `${name} · ${group.rounds ?? "?"} rondas · MAIN→DROP`,
                    exerciseIds,
                    hasCompoundLayout: true,
                },
            ];
        }
        case "amrap": {
            const cap =
                group.timeCapMinutes != null ? `${group.timeCapMinutes} min` : "AMRAP";
            return [
                {
                    key: group.groupId,
                    title: group.badgeLabel,
                    detail: `${joinExerciseNames(group)} · ${cap}`,
                    exerciseIds,
                    hasCompoundLayout: true,
                },
            ];
        }
        case "emom":
            return [
                {
                    key: group.groupId,
                    title: group.badgeLabel,
                    detail: `${joinExerciseNames(group)} · ${group.timeCapMinutes ?? "?"} min EMOM`,
                    exerciseIds,
                    hasCompoundLayout: true,
                },
            ];
        case "for_time":
            return [
                {
                    key: group.groupId,
                    title: group.badgeLabel,
                    detail: `${joinExerciseNames(group)} · ${group.rounds ?? "?"} rondas FOR TIME`,
                    exerciseIds,
                    hasCompoundLayout: true,
                },
            ];
        case "single_set":
        default:
            return group.slots.map((slot) => ({
                key: `${group.groupId}-${slot.slotLabel}`,
                title: slot.exerciseName,
                detail: `${slot.sets.length} ${slot.sets.length === 1 ? "serie" : "series"}`,
                exerciseIds: [slot.exerciseId],
                hasCompoundLayout: false,
            }));
    }
}
