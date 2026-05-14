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

function mapRepsTipoToPayload(
    row: ConstructorRow,
    ex: Pick<
        ConstructorExercise,
        "plannedReps" | "plannedDuration" | "effortCharacter" | "effortValue"
    >
): {
    planned_reps: string | null;
    planned_duration: number | null;
    effort_character: ConstructorExercise["effortCharacter"];
    effort_value: number | null;
} {
    const repsTipo = row.repsTipo ?? "reps";

    if (row.setType === "amrap") {
        return {
            planned_reps: "AMRAP",
            planned_duration: null,
            effort_character: ex.effortCharacter,
            effort_value: ex.effortValue,
        };
    }

    if (repsTipo === "tiempo") {
        return {
            planned_reps: null,
            planned_duration: ex.plannedDuration ?? null,
            effort_character: ex.effortCharacter,
            effort_value: ex.effortValue,
        };
    }

    return {
        planned_reps: ex.plannedReps ?? null,
        planned_duration: null,
        effort_character: ex.effortCharacter,
        effort_value: ex.effortValue,
    };
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
        set_type: row.setType,
        planned_sets: plannedSets,
        planned_reps: mapped.planned_reps,
        planned_duration: mapped.planned_duration,
        planned_weight: ex.plannedWeight,
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

    const blocks: SessionTemplateBlockWithExercisesCreate[] = constructorRows.map(
        (row, rowIndex) => {
            const lines = getConstructorPersistLines(row);
            const exercises: SessionTemplateExerciseCreate[] = lines.map((line) => {
                const fields = line.setDataEntry
                    ? {
                          plannedReps: line.setDataEntry.plannedReps,
                          plannedWeight: line.setDataEntry.plannedWeight,
                          plannedDuration: line.setDataEntry.plannedDuration,
                          effortCharacter: line.setDataEntry.effortCharacter,
                          effortValue: line.setDataEntry.effortValue,
                          notes: line.exercise.notes,
                      }
                    : line.exercise;
                return buildTemplateExercisePayload(
                    row,
                    { ...line.exercise, ...fields },
                    line.orderInBlock,
                    getPersistLinePlannedSets(row, line),
                    row.setType === SET_TYPE.DROPSET
                        ? row.rest
                        : (line.setDataEntry?.rest ?? row.rest)
                );
            });
            return {
                block_type_id: row.blockTypeId,
                order_in_template: rowIndex,
                set_type: row.setType,
                rounds: row.rounds,
                time_cap: row.timeCap,
                interval_seconds: row.intervalSeconds,
                exercises,
            };
        }
    );

    return {
        name: sessionName.trim() || "Plantilla sin nombre",
        description: notes.trim() || null,
        session_type: sessionType,
        estimated_duration: plannedDuration ? Number(plannedDuration) : null,
        is_public: false,
        blocks: blocks.length > 0 ? blocks : undefined,
    };
}
