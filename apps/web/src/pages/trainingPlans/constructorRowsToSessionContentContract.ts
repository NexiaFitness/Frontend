/**
 * Maps constructor rows → SessionBlockContract (template program persist).
 *
 * Reuses the same persist lines + exercise payload as EditSession / buildTemplatePayload.
 * @sync docs/feedback/c-plantillas-programa-completo/11_ANTI_DRIFT_CONTRATOS.md
 */

import type { SessionBlockContract } from "@nexia/shared/types/sessionContentContract";
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor";
import { buildExercisePayloadFromLine } from "@/pages/sessionProgramming/buildExercisePayload";

export function constructorRowsToSessionContentContract(
    rows: ConstructorRow[],
): SessionBlockContract[] {
    return rows.map((row, index) => {
        const persistLines = getConstructorPersistLines(row);
        const exercises = persistLines.map((line) => {
            const base = buildExercisePayloadFromLine(row, line);
            return {
                exercise_id: base.exercise_id,
                order_in_block: base.order_in_block,
                set_type: base.set_type ?? row.setType,
                superset_group_id: base.superset_group_id ?? null,
                dropset_sequence: base.dropset_sequence ?? null,
                planned_sets: base.planned_sets ?? null,
                planned_reps: base.planned_reps ?? null,
                planned_weight: base.planned_weight ?? null,
                planned_duration: base.planned_duration ?? null,
                planned_distance: null,
                planned_rest: base.planned_rest ?? null,
                effort_character: base.effort_character ?? null,
                effort_value: base.effort_value ?? null,
                notes: base.notes ?? null,
            };
        });

        return {
            block_type_id: row.blockTypeId,
            order_in_session: index + 1,
            set_type: row.setType,
            rounds: getBlockRoundsFromConstructorRow(row),
            time_cap: row.timeCap,
            interval_seconds: row.intervalSeconds,
            objective_text:
                row.setType === SET_TYPE.FOR_TIME
                    ? "Objetivo: menor tiempo"
                    : row.setType === SET_TYPE.AMRAP
                      ? "Objetivo: máximo rendimiento"
                      : null,
            exercises,
        };
    });
}
