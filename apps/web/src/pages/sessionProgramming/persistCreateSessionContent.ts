/**
 * Persistencia post-POST de sesión en CreateSession (Fase 0.5 G8).
 * Sin segundo POST de sesión padre; errores explícitos para recovery.
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor";
import { getBlockRoundsFromConstructorRow } from "@nexia/shared/sessionProgramming/blockRounds";
import type { SessionBlockCreate } from "@nexia/shared/types/sessionProgramming";
import { buildExercisePayloadFromLine } from "./buildExercisePayload";

export type PersistTrainingBlocksResult =
    | { ok: true; blocksSaved: number; exercisesSaved: number }
    | {
          ok: false;
          blocksSaved: number;
          exercisesSaved: number;
          message: string;
      };

type CreateBlockFn = (args: {
    sessionId: number;
    data: SessionBlockCreate;
}) => { unwrap: () => Promise<{ id: number }> };

type CreateBlockExerciseFn = (args: {
    blockId: number;
    data: ReturnType<typeof buildExercisePayloadFromLine>;
}) => { unwrap: () => Promise<unknown> };

export async function persistTrainingSessionConstructorContent(args: {
    sessionId: number;
    constructorRows: ConstructorRow[];
    createSessionBlock: CreateBlockFn;
    createSessionBlockExercise: CreateBlockExerciseFn;
}): Promise<PersistTrainingBlocksResult> {
    const { sessionId, constructorRows, createSessionBlock, createSessionBlockExercise } = args;
    let blocksSaved = 0;
    let exercisesSaved = 0;
    const totalBlocks = constructorRows.filter((r) => r.blockTypeId).length;
    const totalEx = constructorRows.reduce(
        (s, r) => s + getConstructorPersistLines(r).length,
        0,
    );

    for (let i = 0; i < constructorRows.length; i++) {
        const row = constructorRows[i];
        if (!row.blockTypeId) continue;
        let createdBlockId: number;
        try {
            const blockPayload = {
                block_type_id: row.blockTypeId,
                order_in_session: i + 1,
                set_type: row.setType,
                rounds: getBlockRoundsFromConstructorRow(row),
                time_cap: row.timeCap,
                interval_seconds: row.intervalSeconds,
                objective_text:
                    row.setType === "for_time"
                        ? "Objetivo: menor tiempo"
                        : row.setType === "amrap"
                          ? "Objetivo: máximo rendimiento"
                          : null,
            };
            const createdBlock = await createSessionBlock({
                sessionId,
                data: blockPayload,
            }).unwrap();
            createdBlockId = createdBlock.id;
            blocksSaved++;
        } catch {
            return {
                ok: false,
                blocksSaved,
                exercisesSaved,
                message:
                    blocksSaved > 0 || exercisesSaved > 0
                        ? `No se guardaron todos los bloques (${blocksSaved}/${totalBlocks}).`
                        : "No se pudieron guardar los bloques de la sesión.",
            };
        }

        const persistable = getConstructorPersistLines(row);
        for (let j = 0; j < persistable.length; j++) {
            const line = persistable[j];
            try {
                const payload = buildExercisePayloadFromLine(row, line);
                await createSessionBlockExercise({
                    blockId: createdBlockId,
                    data: payload,
                }).unwrap();
                exercisesSaved++;
            } catch {
                return {
                    ok: false,
                    blocksSaved,
                    exercisesSaved,
                    message: `Faltan ejercicios por guardar (${exercisesSaved}/${totalEx}).`,
                };
            }
        }
    }

    return { ok: true, blocksSaved, exercisesSaved };
}

export type StandaloneExerciseLine = {
    exercise_id: number;
    order_in_session: number;
    planned_sets: number;
    planned_reps: number | null;
    planned_weight: number | null;
    planned_rest: number | null;
    notes: string | null;
};

type CreateStandaloneExerciseFn = (args: {
    sessionId: number;
    data: {
        exercise_id: number;
        order_in_session: number;
        planned_sets: number;
        planned_reps: number | null;
        planned_weight: number | null;
        planned_rest: number | null;
        notes: string | null;
    };
}) => { unwrap: () => Promise<unknown> };

export async function persistStandaloneSessionExercises(args: {
    sessionId: number;
    exercises: StandaloneExerciseLine[];
    createStandaloneExercise: CreateStandaloneExerciseFn;
}): Promise<{ ok: true; savedCount: number } | { ok: false; savedCount: number; message: string }> {
    const { sessionId, exercises, createStandaloneExercise } = args;
    let savedCount = 0;
    for (const ex of exercises) {
        try {
            await createStandaloneExercise({
                sessionId,
                data: {
                    exercise_id: ex.exercise_id,
                    order_in_session: ex.order_in_session,
                    planned_sets: ex.planned_sets,
                    planned_reps: ex.planned_reps,
                    planned_weight: ex.planned_weight,
                    planned_rest: ex.planned_rest,
                    notes: ex.notes,
                },
            }).unwrap();
            savedCount++;
        } catch {
            return {
                ok: false,
                savedCount,
                message: `Sesión creada; solo ${savedCount}/${exercises.length} ejercicios se guardaron.`,
            };
        }
    }
    return { ok: true, savedCount };
}

export type StandaloneExerciseDesiredLine = StandaloneExerciseLine & {
    serverExerciseId?: number;
};

type UpdateStandaloneExerciseFn = (args: {
    exerciseId: number;
    body: {
        order_in_session: number;
        planned_sets: number;
        planned_reps: number | null;
        planned_weight: number | null;
        planned_rest: number | null;
        notes: string | null;
    };
}) => { unwrap: () => Promise<unknown> };

type DeleteStandaloneExerciseFn = (exerciseId: number) => {
    unwrap: () => Promise<unknown>;
};

/**
 * Diff sync for EditStandaloneSession: create / update / delete using existing BE routes.
 */
export async function syncStandaloneSessionExercises(args: {
    desired: StandaloneExerciseDesiredLine[];
    existingServerIds: number[];
    createStandaloneExercise: CreateStandaloneExerciseFn;
    updateStandaloneExercise: UpdateStandaloneExerciseFn;
    deleteStandaloneExercise: DeleteStandaloneExerciseFn;
    sessionId: number;
}): Promise<
    | { ok: true; created: number; updated: number; deleted: number }
    | { ok: false; created: number; updated: number; deleted: number; message: string }
> {
    const {
        desired,
        existingServerIds,
        createStandaloneExercise,
        updateStandaloneExercise,
        deleteStandaloneExercise,
        sessionId,
    } = args;

    const desiredServerIds = new Set(
        desired.map((d) => d.serverExerciseId).filter((id): id is number => id != null),
    );

    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const serverId of existingServerIds) {
        if (desiredServerIds.has(serverId)) continue;
        try {
            await deleteStandaloneExercise(serverId).unwrap();
            deleted++;
        } catch {
            return {
                ok: false,
                created,
                updated,
                deleted,
                message: `No se pudieron eliminar todos los ejercicios retirados (${deleted} eliminados).`,
            };
        }
    }

    for (const line of desired) {
        const payload = {
            order_in_session: line.order_in_session,
            planned_sets: line.planned_sets,
            planned_reps: line.planned_reps,
            planned_weight: line.planned_weight,
            planned_rest: line.planned_rest,
            notes: line.notes,
        };
        if (line.serverExerciseId != null) {
            try {
                await updateStandaloneExercise({
                    exerciseId: line.serverExerciseId,
                    body: payload,
                }).unwrap();
                updated++;
            } catch {
                return {
                    ok: false,
                    created,
                    updated,
                    deleted,
                    message: `Falló la actualización de ejercicios (${updated} actualizados).`,
                };
            }
        } else {
            try {
                await createStandaloneExercise({
                    sessionId,
                    data: {
                        exercise_id: line.exercise_id,
                        ...payload,
                    },
                }).unwrap();
                created++;
            } catch {
                return {
                    ok: false,
                    created,
                    updated,
                    deleted,
                    message: `Falló la creación de ejercicios nuevos (${created} creados).`,
                };
            }
        }
    }

    return { ok: true, created, updated, deleted };
}
