/**
 * buildTemplatePayload.ts — Mapeo Constructor → API SessionTemplateCreate
 *
 * Convierte constructorRows + formData al payload completo para crear plantilla.
 * single_set: N líneas API con planned_sets: 1 por setData[i].
 *
 * @spec agent.md — Sin parches, alineado con backend
 */

import type {
    SessionTemplateCreate,
    SessionTemplateBlockWithExercisesCreate,
    SessionTemplateExerciseCreate,
} from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow, ConstructorExercise } from "@/components/sessionProgramming/constructorTypes";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { getPersistLinePlannedSets } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import { groupConstructorRowsByBlockInstance } from "@nexia/shared/sessionProgramming/constructorBlockInstance";
import { mapExerciseRepsToPayload } from "@/components/sessionProgramming/constructor/utils/exerciseRepsMode";

function mapRepsTipoToPayload(
    row: ConstructorRow,
    ex: Pick<
        ConstructorExercise,
        "repsTipo" | "plannedReps" | "plannedDuration" | "effortCharacter" | "effortValue"
    >
) {
    return mapExerciseRepsToPayload(ex, row.repsTipo ?? "reps");
}

function buildTemplateExercisePayload(
    row: ConstructorRow,
    ex: ConstructorExercise,
    orderInBlock: number,
    plannedSets: number | null,
    plannedRest: number | null
): SessionTemplateExerciseCreate {
    const mapped = mapRepsTipoToPayload(row, ex);
    return {
        exercise_id: ex.exerciseId,
        order_in_block: orderInBlock,
        constructor_row_key: row.id,
        set_type: row.setType,
        planned_sets: plannedSets,
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: ex.plannedWeight,
        planned_assistance_kg: ex.plannedAssistanceKg ?? null,
        planned_rest: plannedRest,
        effort_character: mapped.effort_character,
        effort_value: mapped.effort_value,
        notes: ex.notes,
    };
}

export interface BuildTemplatePayloadInput {
    constructorRows: ConstructorRow[];
    sessionName: string;
    sessionType: string;
    plannedDuration: string;
    notes: string;
}

/**
 * Construye el payload completo para crear plantilla desde el Constructor.
 */
export function buildTemplatePayloadFromConstructorRows(
    input: BuildTemplatePayloadInput
): SessionTemplateCreate {
    const { constructorRows, sessionName, sessionType, plannedDuration, notes } = input;

    const groups = groupConstructorRowsByBlockInstance(
        constructorRows.filter((r) => r.blockTypeId),
    );

    const blocks: SessionTemplateBlockWithExercisesCreate[] = groups.map((group, blockIndex) => {
        const head = group.rows[0];
        const exercises: SessionTemplateExerciseCreate[] = [];
        let orderInBlock = 0;

        for (const row of group.rows) {
            const lines = getConstructorPersistLines(row);
            for (const line of lines) {
                orderInBlock += 1;
                const fields = line.setDataEntry
                    ? {
                          plannedReps: line.setDataEntry.plannedReps,
                          plannedWeight: line.setDataEntry.plannedWeight,
                          plannedAssistanceKg: line.setDataEntry.plannedAssistanceKg,
                          plannedDuration: line.setDataEntry.plannedDuration,
                          effortCharacter: line.setDataEntry.effortCharacter,
                          effortValue: line.setDataEntry.effortValue,
                          notes: line.exercise.notes,
                      }
                    : line.exercise;
                exercises.push(
                    buildTemplateExercisePayload(
                        row,
                        { ...line.exercise, ...fields },
                        orderInBlock,
                        getPersistLinePlannedSets(row, line),
                        row.setType === SET_TYPE.DROPSET
                            ? row.rest
                            : (line.setDataEntry?.rest ?? row.rest),
                    ),
                );
            }
        }

        return {
            block_type_id: head.blockTypeId,
            order_in_template: blockIndex,
            constructor_block_instance_id: group.blockInstanceId,
            set_type: head.setType,
            rounds: getBlockRoundsFromConstructorRow(head),
            time_cap: head.timeCap,
            interval_seconds: head.intervalSeconds,
            exercises,
        };
    });

    return {
        name: sessionName.trim() || "Plantilla sin nombre",
        description: notes.trim() || null,
        session_type: sessionType,
        estimated_duration: plannedDuration ? Number(plannedDuration) : null,
        is_public: false,
        blocks: blocks.length > 0 ? blocks : undefined,
    };
}
