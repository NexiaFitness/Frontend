/**
 * useSessionExercisesDisplay — Hook para obtener ejercicios de sesión (bloques o legacy)
 *
 * Fuente de verdad: Session Blocks (session_block_exercises).
 * Fallback: Session Exercises (session_exercises) para sesiones legacy.
 *
 * Cuando la sesión tiene bloques: agrega ejercicios de todos los bloques,
 * con nombres de ejercicio y tipo de bloque.
 * Cuando no tiene bloques: usa el endpoint legacy /training-sessions/{id}/exercises.
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md
 * @spec agent.md — Sin deuda técnica, arquitectura profesional
 * @author Frontend Team
 * @since v6.4.0
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
import type { SessionBlock, SessionBlockExercise } from "../../types/sessionProgramming";
import type { SessionExercise } from "../../types/trainingSessions";
import type { AppDispatch } from "../../store";

/** Ejercicio unificado para visualización (bloques o legacy) */
export interface SessionExerciseDisplay {
    id: number;
    exerciseId: number;
    exerciseName: string;
    order: number;
    blockName?: string;
    setType?: string;
    plannedSets: number | null;
    plannedReps: string | null;
    plannedDuration: number | null;
    plannedWeight: number | null;
    plannedRest: number | null;
    effortCharacter: string | null;
    effortValue: number | null;
    actualSets: number | null;
    actualReps: string | null;
    notes: string | null;
}

export type SessionExercisesSource = "blocks" | "legacy";

export interface UseSessionExercisesDisplayResult {
    exercises: SessionExerciseDisplay[];
    source: SessionExercisesSource;
    isLoading: boolean;
    isError: boolean;
}

function blockExerciseToDisplay(
    ex: SessionBlockExercise,
    block: SessionBlock,
    blockName: string,
    exerciseName: string
): SessionExerciseDisplay {
    return {
        id: ex.id,
        exerciseId: ex.exercise_id,
        exerciseName,
        order: ex.order_in_block,
        blockName,
        setType: ex.set_type ?? undefined,
        plannedSets: ex.planned_sets ?? null,
        plannedReps: ex.planned_reps ?? null,
        plannedDuration: ex.planned_duration ?? null,
        plannedWeight: ex.planned_weight ?? null,
        plannedRest: ex.planned_rest ?? null,
        effortCharacter: ex.effort_character ?? null,
        effortValue: ex.effort_value ?? null,
        actualSets: ex.actual_sets ?? null,
        actualReps: ex.actual_reps ?? null,
        notes: ex.notes ?? null,
    };
}

function legacyExerciseToDisplay(ex: SessionExercise): SessionExerciseDisplay {
    const name =
        ex.exercise?.nombre ?? `Ejercicio ${ex.exercise_id}`;
    return {
        id: ex.id,
        exerciseId: ex.exercise_id,
        exerciseName: name,
        order: ex.order_in_session,
        plannedSets: ex.planned_sets ?? null,
        plannedReps: ex.planned_reps != null ? String(ex.planned_reps) : null,
        plannedDuration: ex.planned_duration ?? null,
        plannedWeight: ex.planned_weight ?? null,
        plannedRest: ex.planned_rest ?? null,
        effortCharacter: null,
        effortValue: null,
        actualSets: ex.actual_sets ?? null,
        actualReps: ex.actual_reps != null ? String(ex.actual_reps) : null,
        notes: ex.notes ?? null,
    };
}

const BLOCK_TYPE_TRANSLATIONS: Record<string, string> = {
    "Warm Up": "Calentamiento",
    Core: "Core",
    Conditioning: "Acondicionamiento",
    "Maximum Strength": "Fuerza Máxima",
    "Strength-Speed": "Fuerza-Velocidad",
    "Hypertrophy Strength": "Hipertrofia",
    Plyometrics: "Pliometría",
    "Intensive Aerobic": "Aeróbico Intensivo",
    "Extensive Aerobic": "Aeróbico Extensivo",
};

function getBlockDisplayName(name: string): string {
    return BLOCK_TYPE_TRANSLATIONS[name] ?? name;
}

/**
 * Obtiene los ejercicios de una sesión para visualización.
 * Prioridad: bloques (session_blocks + session_block_exercises) > legacy (session_exercises).
 */
export function useSessionExercisesDisplay(sessionId: number | null): UseSessionExercisesDisplayResult {
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
        { skip: blocks.length === 0 }
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

    const nameMap = useMemo(() => {
        const map: Record<number, string> = {};
        if (exercisesData?.exercises) {
            for (const ex of exercisesData.exercises) {
                map[ex.id] = ex.nombre;
            }
        }
        return map;
    }, [exercisesData]);

    return useMemo(() => {
        if (!sessionId || sessionId <= 0) {
            return {
                exercises: [],
                source: "legacy" as SessionExercisesSource,
                isLoading: false,
                isError: false,
            };
        }

        if (blocks.length > 0) {
            const isLoading =
                isLoadingBlocks ||
                Object.keys(blockExercisesByBlock).length < blocks.length;
            const flat: SessionExerciseDisplay[] = [];
            let order = 0;
            for (const block of blocks.sort((a, b) => a.order_in_session - b.order_in_session)) {
                const exs = blockExercisesByBlock[block.id] ?? [];
                const blockType = blockTypes.find((bt) => bt.id === block.block_type_id);
                const blockName = blockType ? getBlockDisplayName(blockType.name) : "Bloque";
                for (const ex of exs) {
                    const exerciseName = nameMap[ex.exercise_id] ?? `Ejercicio #${ex.exercise_id}`;
                    flat.push(
                        blockExerciseToDisplay(ex, block, blockName, exerciseName)
                    );
                    order++;
                }
            }
            return {
                exercises: flat,
                source: "blocks" as SessionExercisesSource,
                isLoading,
                isError: false,
            };
        }

        return {
            exercises: legacyExercises.map(legacyExerciseToDisplay),
            source: "legacy" as SessionExercisesSource,
            isLoading: isLoadingLegacy,
            isError: isErrorLegacy,
        };
    }, [
        sessionId,
        blocks,
        blockExercisesByBlock,
        blockTypes,
        nameMap,
        legacyExercises,
        isLoadingBlocks,
        isLoadingLegacy,
        isErrorLegacy,
    ]);
}
