/**
 * useClientSetHistory — Historial por serie + bloques a tiempo (F8 / F8b).
 */

import { useMemo } from "react";
import {
    useGetClientSetExecutionsQuery,
    useGetClientTimedBlockResultsQuery,
} from "../../api/clientsApi";
import type {
    ClientSetExecutionRow,
    ClientTimedBlockResultRow,
} from "../../types/trainerSetExecutions";

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
    timedBlocks: ClientTimedBlockResultRow[];
    exercises: SetHistoryExerciseGroup[];
}

export interface UseClientSetHistoryOptions {
    clientId: number | null | undefined;
    exerciseId?: number | null;
    dateRangeWeeks?: SetHistoryDateRangeWeeks;
}

const TIMED_GROUP_KINDS = new Set(["amrap", "emom", "for_time"]);

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

function shouldHideTimedPlaceholder(row: ClientSetExecutionRow): boolean {
    if (!row.group_kind) return false;
    return TIMED_GROUP_KINDS.has(row.group_kind);
}

function groupExecutions(
    items: ClientSetExecutionRow[],
    timedBySession: Map<number, ClientTimedBlockResultRow[]>,
): SetHistorySessionGroup[] {
    const bySession = new Map<number, SetHistorySessionGroup>();

    for (const row of items) {
        if (shouldHideTimedPlaceholder(row)) continue;

        let session = bySession.get(row.training_session_id);
        if (!session) {
            session = {
                trainingSessionId: row.training_session_id,
                sessionDate: row.session_date,
                sessionName: row.session_name,
                timedBlocks: [],
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

    for (const [sessionId, timedRows] of timedBySession) {
        let session = bySession.get(sessionId);
        if (!session) {
            const first = timedRows[0];
            session = {
                trainingSessionId: sessionId,
                sessionDate: first.session_date,
                sessionName: first.session_name,
                timedBlocks: [],
                exercises: [],
            };
            bySession.set(sessionId, session);
        }
        session.timedBlocks = [...timedRows];
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

    const timedQueryArg = useMemo(
        () => ({
            clientId: resolvedId,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
            limit: 100,
        }),
        [resolvedId, dateRange.fromDate, dateRange.toDate],
    );

    const { data, isLoading, isFetching, error, refetch } =
        useGetClientSetExecutionsQuery(queryArg, { skip });

    const {
        data: timedData,
        isLoading: isTimedLoading,
        isFetching: isTimedFetching,
    } = useGetClientTimedBlockResultsQuery(timedQueryArg, { skip });

    const timedBySession = useMemo(() => {
        const map = new Map<number, ClientTimedBlockResultRow[]>();
        for (const row of timedData?.items ?? []) {
            const list = map.get(row.training_session_id) ?? [];
            list.push(row);
            map.set(row.training_session_id, list);
        }
        return map;
    }, [timedData?.items]);

    const sessions = useMemo(
        () => groupExecutions(data?.items ?? [], timedBySession),
        [data?.items, timedBySession],
    );

    const exerciseOptions = useMemo(() => {
        const map = new Map<number, string>();
        for (const row of data?.items ?? []) {
            if (shouldHideTimedPlaceholder(row)) continue;
            map.set(row.exercise_id, row.exercise_name);
        }
        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name, "es"));
    }, [data?.items]);

    const totalRecords =
        (data?.total ?? 0) + (timedData?.total ?? 0);

    return {
        sessions,
        timedBySession,
        total: totalRecords,
        exerciseOptions,
        dateRange,
        isLoading: isLoading || isFetching || isTimedLoading || isTimedFetching,
        error,
        refetch,
        isEmpty: !isLoading && sessions.length === 0,
    };
}
