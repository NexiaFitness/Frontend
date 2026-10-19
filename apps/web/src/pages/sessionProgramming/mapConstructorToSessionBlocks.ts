/**
 * mapConstructorToSessionBlocks.ts — Agrupa filas del constructor en bloques API.
 *
 * Contexto: varias ConstructorRow con el mismo blockInstanceId → un SessionBlock
 * con ejercicios concatenados (order_in_block global).
 *
 * @author Frontend Team
 * @since v6.7.0
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import type { PersistExerciseLine } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { groupConstructorRowsByBlockInstance } from "@nexia/shared/sessionProgramming/constructorBlockInstance";
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import type {
    SessionBlockCreate,
    SessionBlockFullUpdate,
    SessionBlockExerciseCreate,
    SessionBlockExerciseFullUpdate,
} from "@nexia/shared/types/sessionProgramming";
import { buildExercisePayloadFromLine } from "./buildExercisePayload";

function objectiveTextForRow(row: ConstructorRow): string | null {
    if (row.setType === "for_time") {
        return "Objetivo: menor tiempo";
    }
    if (row.setType === "amrap") {
        return "Objetivo: máximo rendimiento";
    }
    return null;
}

function blockMetaFromRow(row: ConstructorRow): Omit<SessionBlockCreate, "order_in_session"> {
    return {
        block_type_id: row.blockTypeId,
        set_type: row.setType,
        rounds: getBlockRoundsFromConstructorRow(row),
        time_cap: row.timeCap,
        interval_seconds: row.intervalSeconds,
        objective_text: objectiveTextForRow(row),
    };
}

function canonicalServerBlockIdFromRows(rows: ConstructorRow[]): number | undefined {
    for (const row of rows) {
        if (row.serverBlockId != null && row.serverBlockId > 0) {
            return row.serverBlockId;
        }
    }
    return undefined;
}

function flattenExerciseLines(
    rows: ConstructorRow[],
    useUpdateIds: boolean,
): SessionBlockExerciseFullUpdate[] {
    const payloads: SessionBlockExerciseFullUpdate[] = [];
    let orderInBlock = 0;

    for (const row of rows) {
        const persistLines = getConstructorPersistLines(row);
        for (const line of persistLines) {
            orderInBlock += 1;
            const createPayload = buildExercisePayloadFromLine(row, {
                ...line,
                orderInBlock,
            });

            if (useUpdateIds && line.serverExerciseId != null) {
                payloads.push({
                    id: line.serverExerciseId,
                    exercise_id: createPayload.exercise_id,
                    constructor_row_key: createPayload.constructor_row_key,
                    order_in_block: orderInBlock,
                    set_type: createPayload.set_type,
                    planned_sets: createPayload.planned_sets,
                    planned_reps: createPayload.planned_reps,
                    planned_duration: createPayload.planned_duration,
                    planned_weight: createPayload.planned_weight,
                    planned_assistance_kg: createPayload.planned_assistance_kg,
                    planned_rest: createPayload.planned_rest,
                    effort_character: createPayload.effort_character,
                    effort_value: createPayload.effort_value,
                    notes: createPayload.notes,
                    superset_group_id: createPayload.superset_group_id,
                    dropset_sequence: createPayload.dropset_sequence,
                });
            } else {
                payloads.push(createPayload);
            }
        }
    }

    return payloads;
}

/**
 * Mapeo para PUT /training-sessions/{id}/full (edición atómica).
 */
export function mapConstructorRowsToFullUpdateBlocks(
    constructorRows: ConstructorRow[],
): SessionBlockFullUpdate[] {
    const groups = groupConstructorRowsByBlockInstance(
        constructorRows.filter((r) => r.blockTypeId),
    );

    return groups.map((group, index) => {
        const head = group.rows[0];
        const canonicalId = canonicalServerBlockIdFromRows(group.rows);
        const exercises = flattenExerciseLines(group.rows, true);

        return {
            ...(canonicalId ? { id: canonicalId } : {}),
            ...blockMetaFromRow(head),
            constructor_block_instance_id: group.blockInstanceId,
            order_in_session: index + 1,
            exercises,
        };
    });
}

/**
 * Mapeo para create: POST bloque + POST ejercicios por grupo.
 */
export function mapConstructorRowsToCreateBlockGroups(constructorRows: ConstructorRow[]): Array<{
    blockPayload: SessionBlockCreate;
    exercisePayloads: SessionBlockExerciseCreate[];
}> {
    const grouped = groupConstructorRowsByBlockInstance(
        constructorRows.filter((r) => r.blockTypeId),
    );

    return grouped.map((group, index) => {
        const head = group.rows[0];
        const blockPayload: SessionBlockCreate = {
            ...blockMetaFromRow(head),
            constructor_block_instance_id: group.blockInstanceId,
            order_in_session: index + 1,
        };

        const exercisePayloads: SessionBlockExerciseCreate[] = [];
        let orderInBlock = 0;

        for (const row of group.rows) {
            const persistLines: PersistExerciseLine[] = getConstructorPersistLines(row);
            for (const line of persistLines) {
                orderInBlock += 1;
                exercisePayloads.push(
                    buildExercisePayloadFromLine(row, { ...line, orderInBlock }),
                );
            }
        }

        return { blockPayload, exercisePayloads };
    });
}
