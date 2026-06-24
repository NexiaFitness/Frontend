/**
 * useClientSetHistory — Historial por serie para ficha trainer (F8).
 */

import { useMemo } from "react";
import { useGetClientSetExecutionsQuery } from "../../api/clientsApi";
import type { ClientSetExecutionRow } from "../../types/trainerSetExecutions";

export type SetHistoryDateRangeWeeks = 4 | 8 | 12;

export interface SetHistoryExerciseGroup {
    exerciseId: number;
    exerciseName: string;
    sets: ClientSetExecutionRow[];
}

export interface SetHistorySessionGroup {
    trainingSessionId: number;
    sessionDate: string | null;
    sessionName: string | null;
    exercises: SetHistoryExerciseGroup[];
}

export interface UseClientSetHistoryOptions {
    clientId: number | null | undefined;
    exerciseId?: number | null;
    dateRangeWeeks?: SetHistoryDateRangeWeeks;
}

function toIsoDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

function compareSets(a: ClientSetExecutionRow, b: ClientSetExecutionRow): number {
    const setA = a.set_index ?? 0;
    const setB = b.set_index ?? 0;
    if (setA !== setB) return setA - setB;
    const roundA = a.round_index ?? 0;
    const roundB = b.round_index ?? 0;
    if (roundA !== roundB) return roundA - roundB;
    const slotA = a.slot_label ?? "";
    const slotB = b.slot_label ?? "";
    return slotA.localeCompare(slotB);
}

function groupExecutions(items: ClientSetExecutionRow[]): SetHistorySessionGroup[] {
    const bySession = new Map<number, SetHistorySessionGroup>();

    for (const row of items) {
        let session = bySession.get(row.training_session_id);
        if (!session) {
            session = {
                trainingSessionId: row.training_session_id,
                sessionDate: row.session_date,
                sessionName: row.session_name,
                exercises: [],
            };
            bySession.set(row.training_session_id, session);
        }

        let exercise = session.exercises.find((e) => e.exerciseId === row.exercise_id);
        if (!exercise) {
            exercise = {
                exerciseId: row.exercise_id,
                exerciseName: row.exercise_name,
                sets: [],
            };
            session.exercises.push(exercise);
        }
        exercise.sets.push(row);
    }

    const sessions = Array.from(bySession.values());
    for (const session of sessions) {
        for (const exercise of session.exercises) {
            exercise.sets.sort(compareSets);
        }
        session.exercises.sort((a, b) =>
            a.exerciseName.localeCompare(b.exerciseName, "es"),
        );
    }

    sessions.sort((a, b) => {
        const da = a.sessionDate ?? "";
        const db = b.sessionDate ?? "";
        return db.localeCompare(da);
    });

    return sessions;
}

export function useClientSetHistory({
    clientId,
    exerciseId,
    dateRangeWeeks = 4,
}: UseClientSetHistoryOptions) {
    const resolvedId = clientId ?? 0;
    const skip = !clientId;

    const dateRange = useMemo(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - dateRangeWeeks * 7);
        return { fromDate: toIsoDate(from), toDate: toIsoDate(to) };
    }, [dateRangeWeeks]);

    const queryArg = useMemo(
        () => ({
            clientId: resolvedId,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
            exerciseId: exerciseId ?? undefined,
            limit: 100,
        }),
        [resolvedId, dateRange.fromDate, dateRange.toDate, exerciseId],
    );

    const { data, isLoading, isFetching, error, refetch } =
        useGetClientSetExecutionsQuery(queryArg, { skip });

    const sessions = useMemo(
        () => groupExecutions(data?.items ?? []),
        [data?.items],
    );

    const exerciseOptions = useMemo(() => {
        const map = new Map<number, string>();
        for (const row of data?.items ?? []) {
            map.set(row.exercise_id, row.exercise_name);
        }
        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name, "es"));
    }, [data?.items]);

    return {
        sessions,
        total: data?.total ?? 0,
        exerciseOptions,
        dateRange,
        isLoading: isLoading || isFetching,
        error,
        refetch,
        isEmpty: !isLoading && (data?.items.length ?? 0) === 0,
    };
}
