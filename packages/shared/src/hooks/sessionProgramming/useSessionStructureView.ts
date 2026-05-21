/**
 * useSessionStructureView — Hook que devuelve la estructura agrupada de una sesión.
 *
 * Contexto:
 * - Combina las queries de session_blocks + session_block_exercises + training_block_types
 *   + catálogo de ejercicios, y aplica el reducer puro `mapBlocksToSessionStructureView`.
 * - Para sesiones legacy (sin bloques) construye un único bloque sintético "Ejercicios"
 *   con un grupo single_set por cada SessionExercise.
 *
 * Sustituye a `useSessionExercisesDisplay` en la vista de detalle (que dibujaba
 * una card por fila plana). El hook plano se mantiene para otros consumidores.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
    useGetSessionBlocksQuery,
    useGetTrainingBlockTypesQuery,
    sessionProgrammingApi,
} from "../../api/sessionProgrammingApi";
import { useGetSessionExercisesQuery } from "../../api/trainingSessionsApi";
import { useGetExercisesQuery } from "../exercises";
import {
    mapBlocksToSessionStructureView,
    type SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";
import {
    SET_TYPE,
    type SessionBlock,
    type SessionBlockExercise,
} from "../../types/sessionProgramming";
import type { SessionExercise } from "../../types/trainingSessions";
import type { AppDispatch } from "../../store";

export type SessionStructureSource = "blocks" | "legacy";

export interface UseSessionStructureViewResult {
    view: SessionStructureView;
    source: SessionStructureSource;
    isLoading: boolean;
    isError: boolean;
}

const EMPTY_VIEW: SessionStructureView = {
    blocks: [],
    totalExercises: 0,
    totalSets: 0,
};

/**
 * Convierte ejercicios legacy en un único SessionBlock sintético con N filas
 * `SessionBlockExercise`, todas con set_type single_set. Cada fila conserva
 * `planned_sets` original para que el reducer expanda correctamente.
 */
function legacyExercisesToBlock(exercises: SessionExercise[]): {
    block: SessionBlock;
    rows: SessionBlockExercise[];
} {
    const block: SessionBlock = {
        id: -1,
        training_session_id: exercises[0]?.training_session_id ?? 0,
        block_type_id: 0,
        order_in_session: 1,
        set_type: SET_TYPE.SINGLE_SET,
        rounds: null,
        time_cap: null,
        interval_seconds: null,
        objective_text: null,
        planned_intensity: null,
        planned_volume: null,
        actual_intensity: null,
        actual_volume: null,
        estimated_duration: null,
        actual_duration: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
    const rows: SessionBlockExercise[] = exercises.map((ex) => ({
        id: ex.id,
        session_block_id: -1,
        exercise_id: ex.exercise_id,
        order_in_block: ex.order_in_session,
        set_type: SET_TYPE.SINGLE_SET,
        superset_group_id: null,
        dropset_sequence: null,
        planned_sets: ex.planned_sets ?? 1,
        planned_reps: ex.planned_reps != null ? String(ex.planned_reps) : null,
        planned_weight: ex.planned_weight ?? null,
        planned_duration: ex.planned_duration ?? null,
        planned_distance: null,
        planned_rest: ex.planned_rest ?? null,
        effort_character: null,
        effort_value: null,
        actual_sets: ex.actual_sets ?? null,
        actual_reps: ex.actual_reps != null ? String(ex.actual_reps) : null,
        actual_weight: null,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: ex.notes ?? null,
        created_at: "",
        updated_at: "",
        is_active: true,
    }));
    return { block, rows };
}

export function useSessionStructureView(
    sessionId: number | null
): UseSessionStructureViewResult {
    const dispatch = useDispatch<AppDispatch>();
    const [blockExercisesByBlock, setBlockExercisesByBlock] = useState<
        Record<number, SessionBlockExercise[]>
    >({});

    const { data: blocks = [], isLoading: isLoadingBlocks } = useGetSessionBlocksQuery(
        sessionId ?? 0,
        { skip: !sessionId || sessionId <= 0 }
    );

    const {
        data: legacyExercises = [],
        isLoading: isLoadingLegacy,
        isError: isErrorLegacy,
    } = useGetSessionExercisesQuery(sessionId ?? 0, {
        skip: !sessionId || sessionId <= 0 || blocks.length > 0,
    });

    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery(
        { skip: 0, limit: 100 },
        { skip: blocks.length === 0 }
    );

    const { data: exercisesData } = useGetExercisesQuery(
        { skip: 0, limit: 500 },
        { skip: blocks.length === 0 && legacyExercises.length === 0 }
    );

    useEffect(() => {
        if (blocks.length === 0) return;
        let cancelled = false;
        const load = async () => {
            const result: Record<number, SessionBlockExercise[]> = {};
            for (const b of blocks) {
                const res = await dispatch(
                    sessionProgrammingApi.endpoints.getSessionBlockExercises.initiate(b.id)
                );
                if (cancelled) return;
                if ("data" in res && res.data) {
                    result[b.id] = res.data;
                }
            }
            if (!cancelled) setBlockExercisesByBlock(result);
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [blocks, dispatch]);

    const exerciseNamesById = useMemo<Record<number, string>>(() => {
        const map: Record<number, string> = {};
        if (exercisesData?.exercises) {
            for (const ex of exercisesData.exercises) {
                map[ex.id] = ex.nombre;
            }
        }
        if (legacyExercises.length > 0) {
            for (const ex of legacyExercises) {
                if (ex.exercise?.nombre) {
                    map[ex.exercise_id] = ex.exercise.nombre;
                }
            }
        }
        return map;
    }, [exercisesData, legacyExercises]);

    return useMemo<UseSessionStructureViewResult>(() => {
        if (!sessionId || sessionId <= 0) {
            return { view: EMPTY_VIEW, source: "legacy", isLoading: false, isError: false };
        }

        if (blocks.length > 0) {
            const isLoading =
                isLoadingBlocks ||
                Object.keys(blockExercisesByBlock).length < blocks.length;
            const view = mapBlocksToSessionStructureView({
                blocks,
                blockExercisesByBlock,
                blockTypes,
                exerciseNamesById,
            });
            return { view, source: "blocks", isLoading, isError: false };
        }

        if (legacyExercises.length === 0) {
            return {
                view: EMPTY_VIEW,
                source: "legacy",
                isLoading: isLoadingLegacy,
                isError: isErrorLegacy,
            };
        }

        const { block, rows } = legacyExercisesToBlock(legacyExercises);
        const view = mapBlocksToSessionStructureView({
            blocks: [block],
            blockExercisesByBlock: { [block.id]: rows },
            blockTypes: [],
            exerciseNamesById,
        });
        // Sobrescribimos el blockTypeName por algo legible
        view.blocks[0].blockTypeName = "Ejercicios";
        return { view, source: "legacy", isLoading: isLoadingLegacy, isError: isErrorLegacy };
    }, [
        sessionId,
        blocks,
        blockExercisesByBlock,
        blockTypes,
        exerciseNamesById,
        legacyExercises,
        isLoadingBlocks,
        isLoadingLegacy,
        isErrorLegacy,
    ]);
}
